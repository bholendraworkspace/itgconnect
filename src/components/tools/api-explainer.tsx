"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getApiResponseExplanation, ExplanationState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles, Lightbulb, Key, Loader2, ServerCrash } from "lucide-react";

const initialState: ExplanationState = {
  message: null,
  data: null,
  errors: null,
};

const exampleJson = {
  "data": {
    "id": "user-12345",
    "type": "users",
    "attributes": {
      "username": "developer_jane",
      "email": "jane.doe@example.com",
      "created_at": "2023-10-27T10:00:00Z",
      "profile": {
        "fullName": "Jane Doe",
        "timeZone": "America/New_York",
        "isVerified": true
      }
    },
    "relationships": {
      "posts": {
        "links": {
          "related": "/users/user-12345/posts"
        },
        "data": [
          { "type": "posts", "id": "post-678" },
          { "type": "posts", "id": "post-910" }
        ]
      }
    }
  },
  "included": [
    {
      "type": "posts",
      "id": "post-678",
      "attributes": {
        "title": "Understanding API Responses",
        "published": true
      }
    }
  ]
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Explain API Response
        </>
      )}
    </Button>
  );
}

export function ApiExplainer() {
  const [state, formAction] = useFormState(
    getApiResponseExplanation,
    initialState
  );

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>AI API Response Explainer</CardTitle>
          <CardDescription>
            Paste a complex API response (JSON) and get a human-readable explanation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="apiResponse"
            placeholder="Paste your JSON API response here"
            className="h-64 font-mono"
            aria-label="API Response Input"
            defaultValue={JSON.stringify(exampleJson, null, 2)}
          />
          {state?.errors?.apiResponse && (
            <p className="text-sm font-medium text-destructive mt-2">
              {state.errors.apiResponse[0]}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
      
      {state.message && state.errors === null && !state.data && (
        <CardContent>
             <Alert variant="destructive">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        </CardContent>
      )}

      {state.data && (
        <CardContent className="space-y-6 pt-6 border-t">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Summary
            </h3>
            <p className="text-muted-foreground">{state.data.summary}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Key className="mr-2 h-5 w-5 text-accent" />
              Key Fields Explanation
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {state.data.keyFieldsExplanation.map((field, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <code className="font-mono text-primary">{field.fieldName}</code>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>{field.description}</p>
                    {field.exampleValue && (
                      <div className="p-2 bg-muted rounded font-mono text-sm text-muted-foreground">
                        Example: {field.exampleValue}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
              Suggestions
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {state.data.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
