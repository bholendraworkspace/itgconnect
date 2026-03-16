"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Code2,
  AlertCircle,
  ChevronRight,
  Calendar,
  Link2,
  Hash,
  Type,
  ToggleLeft,
  List,
  Braces,
} from "lucide-react";

// ─── Example JSON ──────────────────────────────────────────────────────────────
const exampleJson = {
  data: {
    id: "user-12345",
    type: "users",
    attributes: {
      username: "developer_jane",
      email: "jane.doe@example.com",
      created_at: "2023-10-27T10:00:00Z",
      profile: { fullName: "Jane Doe", timeZone: "America/New_York", isVerified: true },
    },
    relationships: {
      posts: {
        links: { related: "/users/user-12345/posts" },
        data: [{ type: "posts", id: "post-678" }],
      },
    },
  },
};

// ─── Pattern detection helpers ─────────────────────────────────────────────────
function detectPattern(key: string, value: unknown): { pattern: string; icon: React.ReactNode } {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value))
      return { pattern: "ISO timestamp", icon: <Calendar className="h-3 w-3 text-blue-400" /> };
    if (/^\d{4}-\d{2}-\d{2}$/.test(value))
      return { pattern: "ISO date", icon: <Calendar className="h-3 w-3 text-blue-400" /> };
    if (/^https?:\/\//i.test(value))
      return { pattern: "URL", icon: <Link2 className="h-3 w-3 text-green-400" /> };
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value))
      return { pattern: "email", icon: <Type className="h-3 w-3 text-purple-400" /> };
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
      return { pattern: "UUID", icon: <Hash className="h-3 w-3 text-amber-400" /> };
    if (/[-_]id$/i.test(key) || /^id$/i.test(key))
      return { pattern: "ID string", icon: <Hash className="h-3 w-3 text-amber-400" /> };
    return { pattern: "string", icon: <Type className="h-3 w-3 text-muted-foreground" /> };
  }
  if (typeof value === "number")
    return { pattern: "number", icon: <Hash className="h-3 w-3 text-orange-400" /> };
  if (typeof value === "boolean")
    return { pattern: "boolean", icon: <ToggleLeft className="h-3 w-3 text-teal-400" /> };
  if (Array.isArray(value))
    return { pattern: `array[${value.length}]`, icon: <List className="h-3 w-3 text-indigo-400" /> };
  if (value !== null && typeof value === "object")
    return { pattern: `object{${Object.keys(value).length}}`, icon: <Braces className="h-3 w-3 text-rose-400" /> };
  if (value === null)
    return { pattern: "null", icon: <Type className="h-3 w-3 text-muted-foreground" /> };
  return { pattern: typeof value, icon: <Type className="h-3 w-3 text-muted-foreground" /> };
}

function formatTimestamp(value: string): string {
  try {
    return new Date(value).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function getDepth(obj: unknown, current = 0): number {
  if (typeof obj !== "object" || obj === null) return current;
  if (Array.isArray(obj)) {
    return Math.max(...(obj.length ? obj.map((v) => getDepth(v, current + 1)) : [current + 1]));
  }
  const values = Object.values(obj as Record<string, unknown>);
  if (!values.length) return current;
  return Math.max(...values.map((v) => getDepth(v, current + 1)));
}

// ─── Field analysis ────────────────────────────────────────────────────────────
interface FieldInfo {
  path: string;
  key: string;
  type: string;
  pattern: string;
  icon: React.ReactNode;
  displayValue: string;
}

function collectFields(
  obj: unknown,
  prefix = "",
  results: FieldInfo[] = [],
  maxDepth = 3,
  depth = 0
): FieldInfo[] {
  if (depth > maxDepth) return results;

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const path = `${prefix}[${i}]`;
      const { pattern, icon } = detectPattern(String(i), item);
      let displayValue = "";
      if (typeof item === "string" && /^\d{4}-\d{2}-\d{2}T/.test(item)) {
        displayValue = formatTimestamp(item);
      } else if (typeof item !== "object" || item === null) {
        displayValue = String(item);
      }
      results.push({
        path,
        key: `[${i}]`,
        type: typeof item === "object" && item !== null ? (Array.isArray(item) ? "array" : "object") : typeof item,
        pattern,
        icon,
        displayValue,
      });
      if (typeof item === "object" && item !== null && depth < maxDepth) {
        collectFields(item, path, results, maxDepth, depth + 1);
      }
    });
  } else if (typeof obj === "object" && obj !== null) {
    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      const { pattern, icon } = detectPattern(key, value);
      let displayValue = "";
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        displayValue = formatTimestamp(value);
      } else if (typeof value !== "object" || value === null) {
        displayValue = String(value);
      }
      results.push({
        path,
        key,
        type: typeof value === "object" && value !== null ? (Array.isArray(value) ? "array" : "object") : typeof value,
        pattern,
        icon,
        displayValue,
      });
      if (typeof value === "object" && value !== null && depth < maxDepth) {
        collectFields(value, path, results, maxDepth, depth + 1);
      }
    });
  }

  return results;
}

// ─── Tree view ─────────────────────────────────────────────────────────────────
function buildTreeLines(obj: unknown, indent = 0, lines: string[] = []): string[] {
  const pad = "  ".repeat(indent);
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      if (typeof item === "object" && item !== null) {
        lines.push(`${pad}[${i}]: {`);
        buildTreeLines(item, indent + 1, lines);
        lines.push(`${pad}}`);
      } else {
        lines.push(`${pad}[${i}]: ${JSON.stringify(item)}`);
      }
    });
  } else if (typeof obj === "object" && obj !== null) {
    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        lines.push(`${pad}${key}: [ ${value.length} items ]`);
      } else if (typeof value === "object" && value !== null) {
        lines.push(`${pad}${key}: {`);
        buildTreeLines(value, indent + 1, lines);
        lines.push(`${pad}}`);
      } else {
        const strVal = JSON.stringify(value);
        const short = strVal && strVal.length > 40 ? strVal.slice(0, 40) + '..."' : strVal;
        lines.push(`${pad}${key}: ${short}`);
      }
    });
  }
  return lines;
}

// ─── Analysis result type ──────────────────────────────────────────────────────
interface AnalysisResult {
  rootType: string;
  rootCount: number;
  depth: number;
  fields: FieldInfo[];
  treeLines: string[];
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function ApiExplainer() {
  const [value, setValue] = useState(JSON.stringify(exampleJson, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    setParseError(null);
    setAnalysis(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }

    const rootType = Array.isArray(parsed) ? "array" : typeof parsed === "object" && parsed !== null ? "object" : typeof parsed;
    const rootCount = Array.isArray(parsed)
      ? parsed.length
      : typeof parsed === "object" && parsed !== null
      ? Object.keys(parsed as Record<string, unknown>).length
      : 1;
    const depth = getDepth(parsed);
    const fields = collectFields(parsed, "", [], 4, 0);
    const treeLines = buildTreeLines(parsed, 0, []);

    setAnalysis({ rootType, rootCount, depth, fields, treeLines });
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-rose-500 to-accent" />
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <CardTitle>JSON Structure Analyzer</CardTitle>
        </div>
        <CardDescription>
          Paste any JSON and get an instant client-side structural breakdown — types, patterns, and a tree view.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setAnalysis(null);
            setParseError(null);
          }}
          placeholder="Paste your JSON here..."
          className="h-56 font-mono text-xs rounded-xl"
          aria-label="JSON Input"
        />

        {/* Parse error */}
        {parseError && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Invalid JSON</p>
              <p className="text-xs mt-0.5 font-mono opacity-80">{parseError}</p>
            </div>
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div className="space-y-4">
            <Separator />

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Root type</p>
                <p className="font-bold text-sm mt-0.5 capitalize">{analysis.rootType}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {analysis.rootType === "array" ? "Items" : "Top-level keys"}
                </p>
                <p className="font-bold text-sm mt-0.5">{analysis.rootCount}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Max depth</p>
                <p className="font-bold text-sm mt-0.5">{analysis.depth}</p>
              </div>
            </div>

            {/* Field breakdown */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <ChevronRight className="h-4 w-4 text-primary" />
                Field Breakdown
                <Badge variant="outline" className="ml-auto text-xs">
                  {analysis.fields.length} fields
                </Badge>
              </h3>
              <ScrollArea className="h-48 rounded-xl border border-border/50">
                <div className="p-2 space-y-1">
                  {analysis.fields.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      <span className="mt-0.5 shrink-0">{f.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold truncate max-w-[200px]">
                            {f.path}
                          </span>
                          <Badge variant="secondary" className="text-xs py-0 px-1.5">
                            {f.pattern}
                          </Badge>
                        </div>
                        {f.displayValue && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {f.displayValue}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Structure map */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <Braces className="h-4 w-4 text-primary" />
                Structure Map
              </h3>
              <ScrollArea className="h-48 rounded-xl border border-border/50 bg-muted/30">
                <pre className="p-3 text-xs font-mono text-muted-foreground leading-relaxed">
                  {analysis.treeLines.join("\n")}
                </pre>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAnalyze}
          className="rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md shadow-primary/30"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze Structure
        </Button>
      </CardFooter>
    </Card>
  );
}
