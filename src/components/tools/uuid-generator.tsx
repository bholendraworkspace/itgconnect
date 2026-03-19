"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, RefreshCw, Trash2 } from "lucide-react";

function generateUUID(): string {
  return crypto.randomUUID();
}

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => [generateUUID()]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const addOne = useCallback(() => {
    setUuids((prev) => [generateUUID(), ...prev]);
  }, []);

  const addBulk = useCallback((count: number) => {
    const batch = Array.from({ length: count }, () => generateUUID());
    setUuids((prev) => [...batch, ...prev]);
  }, []);

  const formatUuid = (uuid: string) => {
    let v = uuid;
    if (noDashes) v = v.replace(/-/g, "");
    if (uppercase) v = v.toUpperCase();
    return v;
  };

  const handleCopy = async (uuid: string, idx: number) => {
    await navigator.clipboard.writeText(formatUuid(uuid));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyAll = async () => {
    const text = uuids.map(formatUuid).join("\n");
    await navigator.clipboard.writeText(text);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">UUID Generator</CardTitle>
          <Badge variant="outline" className="text-[10px]">{uuids.length} generated</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={addOne} className="h-7 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <RefreshCw className="h-3 w-3" /> Generate
          </Button>
          <Button size="sm" variant="secondary" onClick={() => addBulk(5)} className="h-7 text-xs">+5</Button>
          <Button size="sm" variant="secondary" onClick={() => addBulk(10)} className="h-7 text-xs">+10</Button>
          <Button size="sm" variant="outline" onClick={handleCopyAll} className="h-7 text-xs gap-1.5">
            {allCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {allCopied ? "Copied All" : "Copy All"}
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setUppercase(!uppercase)}
              className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${uppercase ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              UPPERCASE
            </button>
            <button
              onClick={() => setNoDashes(!noDashes)}
              className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${noDashes ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              No Dashes
            </button>
            <Button size="sm" variant="ghost" onClick={() => setUuids([generateUUID()])} className="h-7 text-xs gap-1.5">
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          </div>
        </div>

        {/* UUID List */}
        <div className="max-h-64 overflow-y-auto rounded-xl border border-border/50 divide-y divide-border/30">
          {uuids.map((uuid, i) => (
            <div key={`${uuid}-${i}`} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 transition-colors group">
              <span className="text-[10px] text-muted-foreground/50 w-5 text-right">{i + 1}</span>
              <code className="text-xs font-mono flex-1 select-all">{formatUuid(uuid)}</code>
              <button
                onClick={() => handleCopy(uuid, i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                {copiedIdx === i ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
