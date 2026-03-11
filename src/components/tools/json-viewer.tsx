"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export function JsonViewer() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setJsonInput(value);
    if (value.trim() === "") {
      setError(null);
      return;
    }
    try {
      JSON.parse(value);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getFormattedJson = () => {
    if (!jsonInput || error) {
      return jsonInput;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonInput;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>JSON Viewer</CardTitle>
        <CardDescription>
          Paste your JSON below to format and view it.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Paste JSON here..."
            value={jsonInput}
            onChange={handleInputChange}
            className="h-96 font-mono"
            aria-label="JSON Input"
          />
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Invalid JSON</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="relative h-96 rounded-md border bg-muted/50 overflow-auto">
          <pre className="p-4 text-sm font-mono">
            <code>{getFormattedJson()}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
