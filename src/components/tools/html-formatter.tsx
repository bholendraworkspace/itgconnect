"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Trash2 } from "lucide-react";

function formatHtml(html: string, indentSize: number): string {
  const tab = " ".repeat(indentSize);
  let result = "";
  let indent = 0;

  // Remove existing whitespace between tags
  const cleaned = html.replace(/>\s+</g, "><").trim();

  // Self-closing and void tags
  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
  ]);

  const tokens = cleaned.match(/<[^>]+>|[^<]+/g) || [];

  for (const token of tokens) {
    if (token.startsWith("</")) {
      // Closing tag
      indent = Math.max(0, indent - 1);
      result += tab.repeat(indent) + token + "\n";
    } else if (token.startsWith("<")) {
      const tagName = token.match(/<\/?([a-zA-Z0-9-]+)/)?.[1]?.toLowerCase() || "";
      const isSelfClosing = token.endsWith("/>") || voidTags.has(tagName);
      result += tab.repeat(indent) + token + "\n";
      if (!isSelfClosing && !token.startsWith("<!")) {
        indent++;
      }
    } else {
      const text = token.trim();
      if (text) {
        result += tab.repeat(indent) + text + "\n";
      }
    }
  }

  return result.trim();
}

function minifyHtml(html: string): string {
  return html
    .replace(/\n/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

export function HtmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) return;
    setOutput(formatHtml(input, indentSize));
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setOutput(minifyHtml(input));
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 to-purple-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">HTML Formatter</CardTitle>
          {output && (
            <Badge variant="outline" className="text-[10px]">
              {input.length} → {output.length} chars
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={handleFormat} className="h-7 text-xs gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-700">
            Format
          </Button>
          <Button size="sm" variant="secondary" onClick={handleMinify} className="h-7 text-xs">
            Minify
          </Button>
          <div className="flex items-center gap-1.5 border rounded-lg px-2 py-0.5">
            <span className="text-[10px] text-muted-foreground">Indent:</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setIndentSize(n)}
                className={`text-[10px] px-1.5 py-0.5 rounded ${indentSize === n ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!output} className="h-7 text-xs gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setInput(""); setOutput(""); }} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Input</p>
            <Textarea
              placeholder="Paste HTML here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-64 font-mono text-xs rounded-xl resize-none"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Output</p>
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted HTML will appear here..."
              className="h-64 font-mono text-xs bg-muted/30 rounded-xl resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
