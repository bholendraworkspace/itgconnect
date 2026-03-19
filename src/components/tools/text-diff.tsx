"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  leftNum: number | null;
  rightNum: number | null;
}

function computeDiff(a: string, b: string): DiffLine[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const m = linesA.length;
  const n = linesB.length;

  // Simple LCS-based diff
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = linesA[i - 1] === linesB[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = m, j = n;
  const stack: DiffLine[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      stack.push({ type: "unchanged", text: linesA[i - 1], leftNum: i, rightNum: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", text: linesB[j - 1], leftNum: null, rightNum: j });
      j--;
    } else {
      stack.push({ type: "removed", text: linesA[i - 1], leftNum: i, rightNum: null });
      i--;
    }
  }
  stack.reverse().forEach((line) => result.push(line));
  return result;
}

export function TextDiff() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");

  const diff = useMemo(() => computeDiff(original, modified), [original, modified]);

  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;
  const hasContent = original.trim() || modified.trim();

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-red-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Text Diff</CardTitle>
          <div className="flex items-center gap-1.5">
            {hasContent && (
              <>
                <Badge className="text-[10px] bg-emerald-500">+{added}</Badge>
                <Badge variant="destructive" className="text-[10px]">-{removed}</Badge>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setOriginal(""); setModified(""); }} disabled={!hasContent} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Original</p>
            <Textarea
              placeholder="Paste original text..."
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              className="h-40 font-mono text-xs rounded-xl resize-none"
              spellCheck={false}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Modified</p>
            <Textarea
              placeholder="Paste modified text..."
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              className="h-40 font-mono text-xs rounded-xl resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {hasContent && diff.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Diff Output</p>
            <ScrollArea className="max-h-72 rounded-xl border border-border/50 bg-muted/10">
              <div className="font-mono text-xs">
                {diff.map((line, i) => (
                  <div
                    key={i}
                    className={`flex items-stretch border-b border-border/10 ${
                      line.type === "added"
                        ? "bg-emerald-500/10"
                        : line.type === "removed"
                        ? "bg-red-500/10"
                        : ""
                    }`}
                  >
                    <span className="w-10 shrink-0 text-right pr-2 py-0.5 text-muted-foreground/40 select-none border-r border-border/20">
                      {line.leftNum ?? ""}
                    </span>
                    <span className="w-10 shrink-0 text-right pr-2 py-0.5 text-muted-foreground/40 select-none border-r border-border/20">
                      {line.rightNum ?? ""}
                    </span>
                    <span className={`w-5 shrink-0 text-center py-0.5 select-none font-bold ${
                      line.type === "added" ? "text-emerald-600" : line.type === "removed" ? "text-red-500" : "text-muted-foreground/20"
                    }`}>
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    <span className="flex-1 py-0.5 px-2 whitespace-pre-wrap break-all">{line.text}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
