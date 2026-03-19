"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, RefreshCw } from "lucide-react";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "perspiciatis", "unde",
  "omnis", "iste", "natus", "error", "voluptatem", "accusantium", "doloremque",
  "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta",
  "explicabo", "nemo", "ipsam", "quia", "voluptas", "aspernatur", "aut", "odit",
  "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi", "nesciunt",
  "neque", "porro", "quisquam", "nihil", "impedit", "quo", "minus", "quod",
  "maxime", "placeat", "facere", "possimus", "assumenda", "repellendus", "temporibus",
  "quibusdam", "autem", "vel", "necessitatibus", "saepe", "eveniet", "voluptates",
  "repudiandae", "recusandae", "itaque", "earum", "rerum", "hic", "tenetur",
  "sapiente", "delectus", "reiciendis", "voluptatibus", "maiores", "alias",
  "perferendis", "doloribus", "asperiores", "repellat",
];

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateSentence(minWords: number, maxWords: number): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words = Array.from({ length: count }, () => randomWord());
  words[0] = capitalize(words[0]);
  return words.join(" ") + ".";
}

function generateParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 5);
  return Array.from({ length: sentenceCount }, () => generateSentence(6, 16)).join(" ");
}

function generateWords(count: number): string {
  return Array.from({ length: count }, () => randomWord()).join(" ");
}

function generateSentences(count: number): string {
  return Array.from({ length: count }, () => generateSentence(8, 18)).join(" ");
}

function generateParagraphs(count: number): string {
  return Array.from({ length: count }, () => generateParagraph()).join("\n\n");
}

type Mode = "paragraphs" | "sentences" | "words";

export function LoremIpsum() {
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    switch (mode) {
      case "paragraphs": setOutput(generateParagraphs(count)); break;
      case "sentences": setOutput(generateSentences(count)); break;
      case "words": setOutput(generateWords(count)); break;
    }
  }, [mode, count]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-cyan-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Lorem Ipsum Generator</CardTitle>
          {output && (
            <Badge variant="outline" className="text-[10px]">{wordCount} words &middot; {charCount.toLocaleString()} chars</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {(["paragraphs", "sentences", "words"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs px-3 py-1 rounded-lg border transition-colors capitalize ${
                  mode === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Count:</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, +e.target.value)))}
              className="w-20 h-8 text-sm"
            />
          </div>
          <Button size="sm" onClick={generate} className="h-8 text-xs gap-1.5 bg-teal-600 hover:bg-teal-700">
            <RefreshCw className="h-3 w-3" /> Generate
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy} disabled={!output} className="h-8 text-xs gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {output && (
          <div className="rounded-xl border bg-muted/20 p-4 max-h-72 overflow-y-auto">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{output}</p>
          </div>
        )}

        {!output && (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
            <p className="text-sm text-muted-foreground">Click Generate to create placeholder text</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
