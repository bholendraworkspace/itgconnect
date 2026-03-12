"use client";

import { useState } from "react";
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
import { Sparkles, ServerCrash } from "lucide-react";

const exampleJson = {
  data: {
    id: "user-12345",
    type: "users",
    attributes: {
      username: "developer_jane",
      email: "jane.doe@example.com",
      created_at: "2023-10-27T10:00:00Z",
      profile: { fullName: "Jane Doe", timeZone: "America/New_York", isVerified: true },
    },
    relationships: {
      posts: {
        links: { related: "/users/user-12345/posts" },
        data: [{ type: "posts", id: "post-678" }],
      },
    },
  },
};

export function ApiExplainer() {
  const [value, setValue] = useState(JSON.stringify(exampleJson, null, 2));

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI API Response Explainer</CardTitle>
        <CardDescription>
          Paste a complex API response (JSON) and get a human-readable explanation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste your JSON API response here"
          className="h-64 font-mono"
          aria-label="API Response Input"
        />
        <Alert>
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>AI Feature Unavailable</AlertTitle>
          <AlertDescription>
            The AI-powered explanation requires a server environment. This feature is
            available when running the app locally with <code className="font-mono">npm run dev</code>.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button disabled>
          <Sparkles className="mr-2 h-4 w-4" />
          Explain API Response
        </Button>
      </CardFooter>
    </Card>
  );
}
