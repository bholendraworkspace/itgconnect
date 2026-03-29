"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";

interface AmpIssue {
  severity: "error" | "warning";
  message: string;
  line?: number;
  code?: string;
}

function validateAmpHtml(html: string): AmpIssue[] {
  const issues: AmpIssue[] = [];

  // Check for required AMP boilerplate
  if (!html.includes("⚡") && !html.includes("amp")) {
    issues.push({ severity: "error", message: 'Missing AMP attribute on <html> tag. Use <html ⚡> or <html amp>', code: "MISSING_AMP_ATTR" });
  }

  if (!html.includes("https://cdn.ampproject.org/v0.js")) {
    issues.push({ severity: "error", message: "Missing AMP runtime script (https://cdn.ampproject.org/v0.js)", code: "MISSING_AMP_RUNTIME" });
  }

  if (!html.includes("amp-boilerplate")) {
    issues.push({ severity: "error", message: "Missing AMP boilerplate style", code: "MISSING_BOILERPLATE" });
  }

  if (!html.includes('<meta charset="utf-8">') && !html.includes("<meta charset='utf-8'>") && !html.includes("<meta charset=utf-8>")) {
    issues.push({ severity: "error", message: 'Missing <meta charset="utf-8">', code: "MISSING_CHARSET" });
  }

  if (!html.includes('name="viewport"')) {
    issues.push({ severity: "error", message: "Missing viewport meta tag", code: "MISSING_VIEWPORT" });
  }

  if (!html.includes("rel=\"canonical\"") && !html.includes("rel='canonical'")) {
    issues.push({ severity: "error", message: "Missing canonical link tag", code: "MISSING_CANONICAL" });
  }

  // Check for disallowed tags
  const disallowedTags = ["img", "video", "audio", "iframe", "form", "style"];
  for (const tag of disallowedTags) {
    const regex = new RegExp(`<${tag}[\\s>]`, "gi");
    const matches = html.match(regex);
    if (matches) {
      if (tag === "style") {
        // style is allowed only with amp-boilerplate or amp-custom
        const styleRegex = /<style(?![^>]*amp-boilerplate)(?![^>]*amp-custom)[^>]*>/gi;
        const badStyles = html.match(styleRegex);
        if (badStyles) {
          issues.push({
            severity: "error",
            message: `Found <style> without amp-boilerplate or amp-custom attribute (${badStyles.length} occurrence(s))`,
            code: `DISALLOWED_${tag.toUpperCase()}`,
          });
        }
      } else {
        issues.push({
          severity: "error",
          message: `Disallowed <${tag}> tag found. Use <amp-${tag}> instead (${matches.length} occurrence(s))`,
          code: `DISALLOWED_${tag.toUpperCase()}`,
        });
      }
    }
  }

  // Check for inline styles
  if (/style\s*=\s*["']/.test(html)) {
    issues.push({ severity: "error", message: "Inline styles are not allowed in AMP", code: "INLINE_STYLE" });
  }

  // Check for disallowed attributes
  if (/onclick|onload|onerror|onmouseover/i.test(html)) {
    issues.push({ severity: "error", message: "Event handler attributes (onclick, onload, etc.) are not allowed", code: "EVENT_HANDLER" });
  }

  // Warnings
  if (!html.includes("application/ld+json")) {
    issues.push({ severity: "warning", message: "No structured data (JSON-LD) found — recommended for AMP pages", code: "NO_STRUCTURED_DATA" });
  }

  if (!html.includes("amp-analytics")) {
    issues.push({ severity: "warning", message: "No amp-analytics found — consider adding analytics", code: "NO_ANALYTICS" });
  }

  if (issues.length === 0) {
    // This is a basic check, not exhaustive
    issues.push({ severity: "warning", message: "Basic validation passed. For complete validation, use the official AMP Validator.", code: "BASIC_PASS" });
  }

  return issues;
}

export function AmpValidator() {
  const [html, setHtml] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"html" | "url">("html");
  const [issues, setIssues] = useState<AmpIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleValidate = async () => {
    setError(null);
    setIssues([]);
    setChecked(false);
    setLoading(true);

    try {
      let htmlToValidate = html;

      if (mode === "url") {
        if (!url.trim()) { setError("Enter a URL to validate."); return; }
        try {
          const res = await fetch(url);
          htmlToValidate = await res.text();
        } catch {
          setError("Failed to fetch URL. Try pasting the HTML directly (CORS may block fetching).");
          return;
        }
      } else {
        if (!htmlToValidate.trim()) { setError("Paste AMP HTML to validate."); return; }
      }

      setIssues(validateAmpHtml(htmlToValidate));
      setChecked(true);
    } finally {
      setLoading(false);
    }
  };

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-yellow-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">AMP Validator</CardTitle>
          <div className="flex items-center gap-1.5">
            {checked && errors.length === 0 && (
              <Badge className="text-[10px] bg-emerald-600">Valid</Badge>
            )}
            {checked && errors.length > 0 && (
              <Badge variant="destructive" className="text-[10px]">{errors.length} errors</Badge>
            )}
            {checked && warnings.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{warnings.length} warnings</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
          <Button size="sm" onClick={handleValidate} disabled={loading} className="h-7 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700">
            <Search className="h-3 w-3" /> {loading ? "Validating..." : "Validate"}
          </Button>
          <a
            href="https://validator.ampproject.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Official Validator <ExternalLink className="h-3 w-3" />
          </a>
          <Button size="sm" variant="ghost" onClick={() => { setHtml(""); setUrl(""); setIssues([]); setError(null); setChecked(false); }} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        {mode === "html" ? (
          <Textarea
            placeholder="Paste AMP HTML here..."
            value={html}
            onChange={(e) => { setHtml(e.target.value); setChecked(false); }}
            className="h-40 font-mono text-xs rounded-xl resize-none"
            spellCheck={false}
          />
        ) : (
          <Input
            placeholder="https://example.com/amp-page"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setChecked(false); }}
            className="font-mono text-xs rounded-xl"
          />
        )}

        {error && <p className="text-xs text-destructive font-medium">{error}</p>}

        {issues.length > 0 && (
          <div className="rounded-xl border border-border/50 divide-y divide-border/30 max-h-64 overflow-y-auto">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 hover:bg-muted/30">
                {issue.severity === "error" ? (
                  <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs">{issue.message}</p>
                  {issue.code && (
                    <code className="text-[10px] text-muted-foreground">{issue.code}</code>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
