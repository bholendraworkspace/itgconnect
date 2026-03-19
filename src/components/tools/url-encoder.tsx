"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Trash2, ArrowLeftRight } from "lucide-react";

export function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEncode = () => {
    setMode("encode");
    setError(null);
    try {
      setOutput(encodeURIComponent(input));
    } catch {
      setError("Could not encode input.");
    }
  };

  const handleDecode = () => {
    setMode("decode");
    setError(null);
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setError("Could not decode — input contains invalid percent-encoding.");
    }
  };

  const handleEncodeFullUrl = () => {
    setMode("encode");
    setError(null);
    try {
      setOutput(encodeURI(input));
    } catch {
      setError("Could not encode URL.");
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setError(null);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">URL Encoder / Decoder</CardTitle>
          <Badge variant={mode === "encode" ? "default" : "secondary"} className="text-[10px]">
            {mode === "encode" ? "Encoding" : "Decoding"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={handleEncode} className="h-7 text-xs gap-1.5 bg-sky-600 hover:bg-sky-700">
            Encode Component
          </Button>
          <Button size="sm" variant="secondary" onClick={handleEncodeFullUrl} className="h-7 text-xs">
            Encode Full URL
          </Button>
          <Button size="sm" variant="secondary" onClick={handleDecode} className="h-7 text-xs">
            Decode
          </Button>
          <Button size="sm" variant="outline" onClick={handleSwap} disabled={!output} className="h-7 text-xs gap-1.5">
            <ArrowLeftRight className="h-3 w-3" /> Swap
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!output} className="h-7 text-xs gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setInput(""); setOutput(""); setError(null); }} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Input</p>
            <Textarea
              placeholder="https://example.com/path?q=hello world&lang=en"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null); }}
              className="h-48 font-mono text-xs rounded-xl resize-none"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Output</p>
            <Textarea
              placeholder="Result will appear here..."
              value={output}
              readOnly
              className="h-48 font-mono text-xs bg-muted/30 rounded-xl resize-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      </CardContent>
    </Card>
  );
}
