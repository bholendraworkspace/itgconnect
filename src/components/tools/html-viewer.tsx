"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play, Maximize2, Minimize2 } from "lucide-react";

export function HtmlViewer() {
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f9fafb; }
    h1 { color: #1f2937; }
    .card { background: white; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
  </style>
</head>
<body>
  <h1>Hello World</h1>
  <div class="card">
    <p>Edit the HTML on the left to see live preview here.</p>
  </div>
</body>
</html>`);
  const [expanded, setExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const renderHtml = html;

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">HTML Viewer</CardTitle>
          <div className="flex items-center gap-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded accent-pink-500" />
              <span className="text-[10px] text-muted-foreground">Auto-refresh</span>
            </label>
            {html.length > 0 && <Badge variant="outline" className="text-[10px]">{html.length} chars</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          {!autoRefresh && (
            <Button size="sm" className="h-7 text-xs gap-1.5 bg-pink-600 hover:bg-pink-700">
              <Play className="h-3 w-3" /> Render
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setExpanded(!expanded)} className="h-7 text-xs gap-1.5">
            {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            {expanded ? "Collapse" : "Expand"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setHtml("")} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <div className={`grid grid-cols-1 ${expanded ? "" : "md:grid-cols-2"} gap-3`}>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">HTML Source</p>
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              className={`font-mono text-xs rounded-xl resize-none ${expanded ? "h-96" : "h-72"}`}
              spellCheck={false}
              placeholder="Type or paste HTML here..."
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Preview</p>
            <div className={`rounded-xl border border-border/50 overflow-hidden bg-white ${expanded ? "h-96" : "h-72"}`}>
              <iframe
                ref={iframeRef}
                srcDoc={autoRefresh ? renderHtml : undefined}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
                title="HTML Preview"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
