"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";

interface SchemaResult {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  structuredData: Record<string, unknown>[];
  meta: { name: string; content: string }[];
  issues: string[];
  warnings: string[];
}

export function SchemaChecker() {
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [mode, setMode] = useState<"html" | "url">("html");
  const [result, setResult] = useState<SchemaResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseHTML = (rawHtml: string): SchemaResult => {
    const doc = new DOMParser().parseFromString(rawHtml, "text/html");
    const issues: string[] = [];
    const warnings: string[] = [];

    const title = doc.querySelector("title")?.textContent || undefined;
    if (!title) issues.push("Missing <title> tag");
    else if (title.length > 60) warnings.push(`Title is ${title.length} chars (recommended: ≤60)`);

    const descEl = doc.querySelector('meta[name="description"]');
    const description = descEl?.getAttribute("content") || undefined;
    if (!description) issues.push('Missing meta description');
    else if (description.length > 160) warnings.push(`Description is ${description.length} chars (recommended: ≤160)`);

    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || undefined;
    if (!ogImage) warnings.push("Missing og:image");

    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || undefined;
    if (!canonical) warnings.push("Missing canonical URL");

    const robots = doc.querySelector('meta[name="robots"]')?.getAttribute("content") || undefined;

    const structuredData: Record<string, unknown>[] = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
      try {
        structuredData.push(JSON.parse(el.textContent || ""));
      } catch {
        issues.push("Invalid JSON-LD structured data");
      }
    });
    if (structuredData.length === 0) warnings.push("No structured data (JSON-LD) found");

    const meta: { name: string; content: string }[] = [];
    doc.querySelectorAll("meta[name], meta[property]").forEach((el) => {
      const name = el.getAttribute("name") || el.getAttribute("property") || "";
      const content = el.getAttribute("content") || "";
      if (name && content) meta.push({ name, content });
    });

    const h1Count = doc.querySelectorAll("h1").length;
    if (h1Count === 0) warnings.push("No <h1> tag found");
    else if (h1Count > 1) warnings.push(`Multiple <h1> tags found (${h1Count})`);

    const imgsMissingAlt = doc.querySelectorAll("img:not([alt])").length;
    if (imgsMissingAlt > 0) warnings.push(`${imgsMissingAlt} image(s) missing alt attribute`);

    const viewport = doc.querySelector('meta[name="viewport"]');
    if (!viewport) issues.push("Missing viewport meta tag");

    return { title, description, ogImage, canonical, robots, structuredData, meta, issues, warnings };
  };

  const handleCheck = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      if (mode === "html") {
        if (!html.trim()) { setError("Paste HTML to analyze."); return; }
        setResult(parseHTML(html));
      } else {
        if (!url.trim()) { setError("Enter a URL."); return; }
        try {
          const res = await fetch(url);
          const text = await res.text();
          setResult(parseHTML(text));
        } catch {
          setError("Failed to fetch URL. Try pasting the HTML directly (CORS may block fetching).");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Schema & SEO Checker</CardTitle>
          {result && (
            <div className="flex items-center gap-1.5">
              {result.issues.length > 0 && <Badge variant="destructive" className="text-[10px]">{result.issues.length} issues</Badge>}
              {result.warnings.length > 0 && <Badge variant="secondary" className="text-[10px]">{result.warnings.length} warnings</Badge>}
              {result.issues.length === 0 && result.warnings.length === 0 && <Badge className="text-[10px] bg-emerald-600">All Good</Badge>}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mode toggle and actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setMode("html")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${mode === "html" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >Paste HTML</button>
            <button
              onClick={() => setMode("url")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${mode === "url" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >Fetch URL</button>
          </div>
          <Button size="sm" onClick={handleCheck} disabled={loading} className="h-7 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700">
            <Search className="h-3 w-3" /> {loading ? "Checking..." : "Check"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setHtml(""); setUrl(""); setResult(null); setError(null); }} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        {/* Input */}
        {mode === "html" ? (
          <Textarea
            placeholder="Paste HTML source code here..."
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="h-40 font-mono text-xs rounded-xl resize-none"
            spellCheck={false}
          />
        ) : (
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono text-xs rounded-xl"
          />
        )}

        {error && <p className="text-xs text-destructive font-medium">{error}</p>}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Issues & Warnings */}
            {(result.issues.length > 0 || result.warnings.length > 0) && (
              <div className="rounded-xl border border-border/50 divide-y divide-border/30">
                {result.issues.map((issue, i) => (
                  <div key={`i-${i}`} className="flex items-start gap-2 px-3 py-2 text-xs">
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
                {result.warnings.map((warn, i) => (
                  <div key={`w-${i}`} className="flex items-start gap-2 px-3 py-2 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Basic Info */}
            <div className="rounded-xl border border-border/50 divide-y divide-border/30">
              {[
                { label: "Title", value: result.title },
                { label: "Description", value: result.description },
                { label: "Canonical", value: result.canonical },
                { label: "OG Image", value: result.ogImage },
                { label: "Robots", value: result.robots },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label} className="flex items-start gap-3 px-3 py-2 hover:bg-muted/30">
                  <Badge variant="secondary" className="text-[10px] shrink-0 min-w-[80px] justify-center">{row.label}</Badge>
                  <span className="text-xs break-all flex-1">{row.value}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>

            {/* Structured Data */}
            {result.structuredData.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Structured Data (JSON-LD)</span>
                <pre className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs font-mono overflow-auto max-h-48">
                  {JSON.stringify(result.structuredData, null, 2)}
                </pre>
              </div>
            )}

            {/* All Meta Tags */}
            {result.meta.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">All Meta Tags ({result.meta.length})</span>
                <div className="rounded-xl border border-border/50 divide-y divide-border/30 max-h-48 overflow-y-auto">
                  {result.meta.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-1.5 hover:bg-muted/30">
                      <code className="text-[10px] text-muted-foreground shrink-0 min-w-[120px]">{m.name}</code>
                      <code className="text-[10px] break-all flex-1">{m.content}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
