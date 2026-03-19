"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Copy, Check, Minimize2, Maximize2, Trash2 } from "lucide-react";

export function JsonViewer() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const getFormattedJson = useCallback(() => {
    if (!jsonInput || error) return jsonInput;
    try {
      return JSON.stringify(JSON.parse(jsonInput), null, 2);
    } catch {
      return jsonInput;
    }
  }, [jsonInput, error]);

  const handleFormat = () => {
    if (!jsonInput.trim()) return;
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMinify = () => {
    if (!jsonInput.trim()) return;
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopy = async () => {
    const output = getFormattedJson();
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValid = jsonInput.trim() !== "" && !error;
  const charCount = jsonInput.length;
  const lineCount = jsonInput ? jsonInput.split("\n").length : 0;

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">JSON Formatter & Validator</CardTitle>
          <div className="flex items-center gap-1.5">
            {isValid && <Badge variant="default" className="text-[10px] bg-emerald-500">Valid</Badge>}
            {error && <Badge variant="destructive" className="text-[10px]">Invalid</Badge>}
            {charCount > 0 && (
              <Badge variant="outline" className="text-[10px]">{charCount.toLocaleString()} chars &middot; {lineCount} lines</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handleFormat} disabled={!jsonInput.trim()} className="h-7 text-xs gap-1.5">
            <Maximize2 className="h-3 w-3" /> Format
          </Button>
          <Button size="sm" variant="outline" onClick={handleMinify} disabled={!jsonInput.trim()} className="h-7 text-xs gap-1.5">
            <Minimize2 className="h-3 w-3" /> Minify
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!isValid} className="h-7 text-xs gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setJsonInput(""); setError(null); }} disabled={!jsonInput} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        {/* Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Input</p>
            <Textarea
              placeholder='{"key": "value"}'
              value={jsonInput}
              onChange={handleInputChange}
              className="h-80 font-mono text-xs rounded-xl resize-none"
              aria-label="JSON Input"
              spellCheck={false}
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Formatted Output</p>
            <div className="relative h-80 rounded-xl border bg-muted/30 overflow-auto">
              <pre className="p-3 text-xs font-mono leading-relaxed">
                <code>{getFormattedJson()}</code>
              </pre>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <Terminal className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Parse Error</AlertTitle>
            <AlertDescription className="text-xs font-mono">{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
