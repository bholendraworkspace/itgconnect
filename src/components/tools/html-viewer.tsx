"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function HtmlViewer() {
  const [htmlInput, setHtmlInput] = useState("<h1>Hello, World!</h1>\n<p>Render your HTML here.</p>");

  return (
    <Card>
      <CardHeader>
        <CardTitle>HTML Viewer</CardTitle>
        <CardDescription>
          Paste your HTML code to see a live preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea
          placeholder="Paste HTML here..."
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          className="h-96 font-mono"
          aria-label="HTML Input"
        />
        <iframe
          srcDoc={htmlInput}
          title="HTML Preview"
          sandbox="allow-scripts"
          className="h-96 w-full rounded-md border"
        />
      </CardContent>
    </Card>
  );
}
