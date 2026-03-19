"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RegexTester() {
  const [pattern, setPattern] = useState("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
  const [flags, setFlags] = useState("gi");
  const [testString, setTestString] = useState(
    "Contact us at support@example.com or sales@company.org.\nInvalid emails: @bad, no-at-sign.com\nAnother valid: dev.team+test@sub.domain.co.uk"
  );

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] as RegExpMatchArray[] };
    try {
      const re = new RegExp(pattern, flags);
      const allMatches: RegExpMatchArray[] = [];
      let match: RegExpExecArray | null;
      const globalRe = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      let safety = 0;
      while ((match = globalRe.exec(testString)) !== null && safety < 500) {
        allMatches.push(match);
        if (match.index === globalRe.lastIndex) globalRe.lastIndex++;
        safety++;
      }
      return { regex: re, error: null, matches: allMatches };
    } catch (e) {
      return { regex: null, error: (e as Error).message, matches: [] as RegExpMatchArray[] };
    }
  }, [pattern, flags, testString]);

  const highlightedText = useMemo(() => {
    if (!regex || !testString || matches.length === 0) return null;
    const parts: { text: string; isMatch: boolean; idx: number }[] = [];
    let lastEnd = 0;
    matches.forEach((m, idx) => {
      const start = m.index!;
      const end = start + m[0].length;
      if (start > lastEnd) {
        parts.push({ text: testString.slice(lastEnd, start), isMatch: false, idx });
      }
      parts.push({ text: m[0], isMatch: true, idx });
      lastEnd = end;
    });
    if (lastEnd < testString.length) {
      parts.push({ text: testString.slice(lastEnd), isMatch: false, idx: -1 });
    }
    return parts;
  }, [regex, testString, matches]);

  const flagOptions = [
    { flag: "g", label: "Global" },
    { flag: "i", label: "Case Insensitive" },
    { flag: "m", label: "Multiline" },
    { flag: "s", label: "Dotall" },
  ];

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 to-pink-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Regex Tester</CardTitle>
          <div className="flex items-center gap-1.5">
            {matches.length > 0 && (
              <Badge variant="default" className="text-[10px] bg-fuchsia-600">{matches.length} match{matches.length !== 1 ? "es" : ""}</Badge>
            )}
            {error && <Badge variant="destructive" className="text-[10px]">Invalid</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pattern input */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Pattern</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-mono">/</span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="font-mono text-sm flex-1"
              spellCheck={false}
            />
            <span className="text-muted-foreground text-sm font-mono">/</span>
            <Input
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="font-mono text-sm w-16"
              spellCheck={false}
            />
          </div>
          {error && <p className="text-xs text-destructive font-mono">{error}</p>}
        </div>

        {/* Flag toggles */}
        <div className="flex items-center gap-2">
          {flagOptions.map(({ flag, label }) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${flags.includes(flag) ? "bg-fuchsia-600 text-white border-fuchsia-600" : "border-border text-muted-foreground hover:border-fuchsia-400"}`}
            >
              {flag} — {label}
            </button>
          ))}
        </div>

        {/* Test string */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Test String</Label>
          <Textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test string..."
            className="h-28 font-mono text-xs rounded-xl resize-none"
            spellCheck={false}
          />
        </div>

        {/* Highlighted output */}
        {highlightedText && highlightedText.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Highlighted Matches</p>
            <div className="rounded-xl border bg-muted/20 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
              {highlightedText.map((part, i) =>
                part.isMatch ? (
                  <mark key={i} className="bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 rounded-sm px-0.5">{part.text}</mark>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>
          </div>
        )}

        {/* Match list */}
        {matches.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Match Details</p>
            <ScrollArea className="max-h-40 rounded-xl border border-border/50">
              <div className="divide-y divide-border/30">
                {matches.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 text-xs">
                    <span className="text-muted-foreground/50 w-5 text-right">{i + 1}</span>
                    <code className="font-mono flex-1 text-fuchsia-600 dark:text-fuchsia-400">{m[0]}</code>
                    <span className="text-muted-foreground text-[10px]">index {m.index}</span>
                    {m.length > 1 && (
                      <span className="text-muted-foreground text-[10px]">{m.length - 1} group{m.length > 2 ? "s" : ""}</span>
                    )}
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
