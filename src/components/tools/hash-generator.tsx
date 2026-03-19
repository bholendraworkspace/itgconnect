"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Trash2 } from "lucide-react";

async function computeHash(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface HashResult {
  algorithm: string;
  displayName: string;
  hash: string;
}

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<HashResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [uppercase, setUppercase] = useState(false);

  const algorithms = [
    { id: "SHA-1", name: "SHA-1" },
    { id: "SHA-256", name: "SHA-256" },
    { id: "SHA-384", name: "SHA-384" },
    { id: "SHA-512", name: "SHA-512" },
  ];

  const generateAll = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const hashes = await Promise.all(
        algorithms.map(async (algo) => ({
          algorithm: algo.id,
          displayName: algo.name,
          hash: await computeHash(algo.id, input),
        }))
      );
      setResults(hashes);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleCopy = async (hash: string, algo: string) => {
    const value = uppercase ? hash.toUpperCase() : hash;
    await navigator.clipboard.writeText(value);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-slate-500 to-zinc-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Hash Generator</CardTitle>
          {input.length > 0 && (
            <Badge variant="outline" className="text-[10px]">{new TextEncoder().encode(input).length} bytes</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={generateAll} disabled={!input.trim() || loading} className="h-7 text-xs gap-1.5">
            {loading ? "Hashing..." : "Generate Hashes"}
          </Button>
          <button
            onClick={() => setUppercase(!uppercase)}
            className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${uppercase ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
          >
            UPPERCASE
          </button>
          <Button size="sm" variant="ghost" onClick={() => { setInput(""); setResults([]); }} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <Textarea
          placeholder="Enter text to hash..."
          value={input}
          onChange={(e) => { setInput(e.target.value); setResults([]); }}
          className="h-28 font-mono text-xs rounded-xl resize-none"
          spellCheck={false}
        />

        {results.length > 0 && (
          <div className="rounded-xl border border-border/50 divide-y divide-border/30">
            {results.map((result) => (
              <div key={result.algorithm} className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors group">
                <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5 min-w-[60px] justify-center">
                  {result.displayName}
                </Badge>
                <code className="text-xs font-mono flex-1 break-all select-all leading-relaxed">
                  {uppercase ? result.hash.toUpperCase() : result.hash}
                </code>
                <button
                  onClick={() => handleCopy(result.hash, result.algorithm)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                >
                  {copied === result.algorithm ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
