"use client";

import { useState } from "react";
import { JsonViewer } from "@/components/tools/json-viewer";
import { Base64Tool } from "@/components/tools/base64-tool";
import { TimestampConverter } from "@/components/tools/timestamp-converter";
import { UrlEncoder } from "@/components/tools/url-encoder";
import { UuidGenerator } from "@/components/tools/uuid-generator";
import { JwtDecoder } from "@/components/tools/jwt-decoder";
import { ColorConverter } from "@/components/tools/color-converter";
import { HashGenerator } from "@/components/tools/hash-generator";
import { TextDiff } from "@/components/tools/text-diff";
import { MarkdownPreview } from "@/components/tools/markdown-preview";
import { ApiCollectionManager } from "@/components/tools/api-collection";
import { PasswordGenerator } from "@/components/tools/password-generator";
import { SchemaChecker } from "@/components/tools/schema-checker";
import { HtmlViewer } from "@/components/tools/html-viewer";
import { HtmlFormatter } from "@/components/tools/html-formatter";
import { CssMinifier } from "@/components/tools/css-minifier";
import { CssGradientGenerator } from "@/components/tools/css-gradient-generator";
import { PurgeUrl } from "@/components/tools/purge-url";
import { AmpValidator } from "@/components/tools/amp-validator";
import { PageSpeed } from "@/components/tools/pagespeed";
import { cn } from "@/lib/utils";
import {
  Braces,
  Binary,
  Clock,
  Link2,
  Fingerprint,
  KeyRound,
  Palette,
  Hash,
  Wrench,
  FileText,
  Type,
  BookOpen,
  ShieldCheck,
  Eye,
  Code2,
  Minimize2,
  Paintbrush,
  Zap,
  Gauge,
  Lock,
  FileCode,
  LayoutGrid,
} from "lucide-react";

const categories = [
  { id: "all", label: "All Tools", icon: LayoutGrid },
  { id: "api", label: "API & Data" },
  { id: "encode", label: "Encode / Decode" },
  { id: "web", label: "HTML & CSS" },
  { id: "testing", label: "Testing & SEO" },
  { id: "utility", label: "Utilities" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

const tools = [
  { id: "api-collection", label: "API Collections", icon: BookOpen, color: "from-violet-500 to-fuchsia-500", category: "api" },
  { id: "json-viewer", label: "JSON Formatter", icon: Braces, color: "from-blue-500 to-cyan-500", category: "api" },
  { id: "jwt-decoder", label: "JWT Decoder", icon: KeyRound, color: "from-yellow-500 to-amber-500", category: "encode" },
  { id: "base64", label: "Base64", icon: Binary, color: "from-emerald-500 to-teal-500", category: "encode" },
  { id: "url-encoder", label: "URL Encoder", icon: Link2, color: "from-sky-500 to-blue-500", category: "encode" },
  { id: "password-generator", label: "Password Generator", icon: Lock, color: "from-rose-500 to-pink-500", category: "encode" },
  { id: "hash-generator", label: "Hash Generator", icon: Hash, color: "from-slate-500 to-zinc-500", category: "encode" },
  { id: "html-viewer", label: "HTML Viewer", icon: Eye, color: "from-pink-500 to-rose-500", category: "web" },
  { id: "html-formatter", label: "HTML Formatter", icon: Code2, color: "from-fuchsia-500 to-purple-500", category: "web" },
  { id: "css-minifier", label: "CSS Minifier", icon: Minimize2, color: "from-blue-500 to-indigo-500", category: "web" },
  { id: "css-gradient", label: "CSS Gradient", icon: Paintbrush, color: "from-violet-500 to-pink-500", category: "web" },
  { id: "markdown-preview", label: "Markdown", icon: Type, color: "from-purple-500 to-indigo-500", category: "web" },
  { id: "schema-checker", label: "Schema Check", icon: FileCode, color: "from-cyan-500 to-blue-500", category: "testing" },
  { id: "amp-validator", label: "AMP Validator", icon: ShieldCheck, color: "from-amber-500 to-yellow-500", category: "testing" },
  { id: "pagespeed", label: "PageSpeed", icon: Gauge, color: "from-green-500 to-teal-500", category: "testing" },
  { id: "purge-url", label: "Purge URL", icon: Zap, color: "from-red-500 to-orange-500", category: "testing" },
  { id: "text-diff", label: "Diff Checker", icon: FileText, color: "from-orange-500 to-red-500", category: "utility" },
  { id: "timestamp", label: "Timestamp", icon: Clock, color: "from-amber-500 to-orange-500", category: "utility" },
  { id: "uuid-generator", label: "UUID Generator", icon: Fingerprint, color: "from-indigo-500 to-violet-500", category: "utility" },
  { id: "color-converter", label: "Color Converter", icon: Palette, color: "from-green-500 to-emerald-500", category: "utility" },
] as const;

type ToolId = (typeof tools)[number]["id"];

const toolComponents: Record<ToolId, React.FC> = {
  "api-collection": ApiCollectionManager,
  "json-viewer": JsonViewer,
  "jwt-decoder": JwtDecoder,
  base64: Base64Tool,
  "url-encoder": UrlEncoder,
  "password-generator": PasswordGenerator,
  "hash-generator": HashGenerator,
  "html-viewer": HtmlViewer,
  "html-formatter": HtmlFormatter,
  "css-minifier": CssMinifier,
  "css-gradient": CssGradientGenerator,
  "markdown-preview": MarkdownPreview,
  "schema-checker": SchemaChecker,
  "amp-validator": AmpValidator,
  pagespeed: PageSpeed,
  "purge-url": PurgeUrl,
  "text-diff": TextDiff,
  timestamp: TimestampConverter,
  "uuid-generator": UuidGenerator,
  "color-converter": ColorConverter,
};

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId>("api-collection");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");

  const filteredTools = activeCategory === "all" ? tools : tools.filter((t) => t.category === activeCategory);
  const ActiveComponent = toolComponents[activeTool];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Developer Tools</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          All tools run client-side in your browser. Nothing leaves your machine.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 overflow-x-auto pb-px">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = cat.id === "all" ? tools.length : tools.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium border-b-2 transition-all duration-150 -mb-px",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {cat.label}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tool selector */}
      <div className="flex flex-wrap gap-2">
        {filteredTools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <div className={cn("flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br text-white", tool.color)}>
                <tool.icon className="h-3 w-3" />
              </div>
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Active tool */}
      <ActiveComponent />
    </div>
  );
}
