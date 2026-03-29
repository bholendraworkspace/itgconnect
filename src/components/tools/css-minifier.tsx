"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Trash2 } from "lucide-react";

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")    // Remove comments
    .replace(/\s+/g, " ")                 // Collapse whitespace
    .replace(/\s*([{}:;,>~+])\s*/g, "$1") // Remove space around symbols
    .replace(/;}/g, "}")                   // Remove last semicolon
    .replace(/^\s+|\s+$/g, "")            // Trim
    .trim();
}

function beautifyCss(css: string, indent: number): string {
  const tab = " ".repeat(indent);
  // First minify to normalize
  const minified = minifyCss(css);
  let result = "";
  let level = 0;

  for (let i = 0; i < minified.length; i++) {
    const c = minified[i];
    if (c === "{") {
      result += " {\n";
      level++;
      result += tab.repeat(level);
    } else if (c === "}") {
      result = result.trimEnd();
      result += "\n";
      level = Math.max(0, level - 1);
      result += tab.repeat(level) + "}\n";
      if (level === 0) result += "\n";
      result += tab.repeat(level);
    } else if (c === ";") {
      result += ";\n" + tab.repeat(level);
    } else if (c === ":" && minified[i + 1] !== ":") {
      result += ": ";
    } else {
      result += c;
    }
  }

  return result.trim();
}

export function CssMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleMinify = () => {
    if (!input.trim()) return;
    setOutput(minifyCss(input));
  };

  const handleBeautify = () => {
    if (!input.trim()) return;
    setOutput(beautifyCss(input, 2));
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const savings = input && output ? Math.round((1 - output.length / input.length) * 100) : 0;

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">CSS Minifier / Beautifier</CardTitle>
          {output && savings > 0 && (
            <Badge className="text-[10px] bg-emerald-600">{savings}% smaller</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={handleMinify} className="h-7 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700">
            Minify
          </Button>
          <Button size="sm" variant="secondary" onClick={handleBeautify} className="h-7 text-xs">
            Beautify
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!output} className="h-7 text-xs gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setInput(""); setOutput(""); }} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        {input && output && (
          <div className="flex gap-3 text-[10px] text-muted-foreground">
            <span>Input: {input.length.toLocaleString()} chars</span>
            <span>→</span>
            <span>Output: {output.length.toLocaleString()} chars</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Input CSS</p>
            <Textarea
              placeholder="Paste CSS here..."
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
              placeholder="Result will appear here..."
              className="h-64 font-mono text-xs bg-muted/30 rounded-xl resize-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
