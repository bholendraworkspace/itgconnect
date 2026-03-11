"use server";

import {
  explainApiResponse,
  type ExplainApiResponseOutput,
} from "@/ai/flows/explain-api-response";
import { z } from "zod";

const FormSchema = z.object({
  apiResponse: z
    .string()
    .min(10, { message: "API response must be at least 10 characters." }),
});

export type ExplanationState = {
  message?: string | null;
  data?: ExplainApiResponseOutput | null;
  errors?: {
    apiResponse?: string[];
  } | null;
};

export async function getApiResponseExplanation(
  prevState: ExplanationState,
  formData: FormData
): Promise<ExplanationState> {
  const validatedFields = FormSchema.safeParse({
    apiResponse: formData.get("apiResponse"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your input.",
      data: null,
    };
  }

  try {
    const result = await explainApiResponse({
      apiResponse: validatedFields.data.apiResponse,
    });
    return {
      message: "Explanation generated successfully.",
      data: result,
      errors: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "An error occurred while generating the explanation. Please try again.",
      data: null,
      errors: null,
    };
  }
}
