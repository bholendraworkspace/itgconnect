'use server';
/**
 * @fileOverview An AI tool to explain complex API responses.
 *
 * - explainApiResponse - A function that handles the API response explanation process.
 * - ExplainApiResponseInput - The input type for the explainApiResponse function.
 * - ExplainApiResponseOutput - The return type for the explainApiResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainApiResponseInputSchema = z.object({
  apiResponse: z.string().describe('The complex API response in JSON format to be explained.'),
});
export type ExplainApiResponseInput = z.infer<typeof ExplainApiResponseInputSchema>;

const ExplainApiResponseOutputSchema = z.object({
  summary: z.string().describe('A human-readable, high-level summary of the API response.'),
  keyFieldsExplanation: z
    .array(
      z.object({
        fieldName: z.string().describe('The name of a key field in the API response.'),
        description: z.string().describe('A detailed explanation of what this field represents.'),
        exampleValue: z
          .string()
          .nullable()
          .describe('An example value for this field, if applicable. Can be null.'),
      })
    )
    .describe('An array of explanations for important fields found in the API response.'),
  suggestions: z
    .array(z.string())
    .describe('Suggestions for next steps or common issues related to this API response.'),
});
export type ExplainApiResponseOutput = z.infer<typeof ExplainApiResponseOutputSchema>;

export async function explainApiResponse(
  input: ExplainApiResponseInput
): Promise<ExplainApiResponseOutput> {
  return explainApiResponseFlow(input);
}

const explainApiResponsePrompt = ai.definePrompt({
  name: 'explainApiResponsePrompt',
  input: {schema: ExplainApiResponseInputSchema},
  output: {schema: ExplainApiResponseOutputSchema},
  prompt: `You are an expert API documentation assistant. Your task is to explain complex API responses in a clear, human-readable format, specifically for developers.

Analyze the provided API response and provide:
1. A high-level summary of the entire response.
2. Explanations for key fields, including their name, a description, and an example value if available. Focus on fields that are most critical for a developer to understand.
3. Practical suggestions for next steps or common issues a developer might encounter with this type of response.

API Response:
{{{apiResponse}}}`,
});

const explainApiResponseFlow = ai.defineFlow(
  {
    name: 'explainApiResponseFlow',
    inputSchema: ExplainApiResponseInputSchema,
    outputSchema: ExplainApiResponseOutputSchema,
  },
  async input => {
    const {output} = await explainApiResponsePrompt(input);
    return output!;
  }
);
