"use client";

import { useState } from "react";
import { BirthdayCorner, SpecialAnnouncementsCorner } from "@/components/dashboard/corners";
import { AchievementsCorner, RecognitionCorner } from "@/components/dashboard/achievements";
import { IdeasCorner } from "@/components/dashboard/ideas";
import { OrganizeEvent } from "@/components/dashboard/events";
import { useUser } from "@/firebase";
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
  Rocket,
  ChevronDown,
  Cake,
  Award,
  Lightbulb,
  CalendarDays,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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
  { id: "api-collection", label: "API Collections", icon: BookOpen, color: "from-violet-500 to-fuchsia-500", description: "Import & browse API docs", category: "api" },
  { id: "json-viewer", label: "JSON Formatter", icon: Braces, color: "from-blue-500 to-cyan-500", description: "Format, validate & minify", category: "api" },
  { id: "jwt-decoder", label: "JWT Decoder", icon: KeyRound, color: "from-yellow-500 to-amber-500", description: "Decode bearer tokens", category: "encode" },
  { id: "base64", label: "Base64", icon: Binary, color: "from-emerald-500 to-teal-500", description: "Encode & decode strings", category: "encode" },
  { id: "url-encoder", label: "URL Encoder", icon: Link2, color: "from-sky-500 to-blue-500", description: "Encode & decode URLs", category: "encode" },
  { id: "password-generator", label: "Password Generator", icon: Lock, color: "from-rose-500 to-pink-500", description: "Generate secure passwords", category: "encode" },
  { id: "hash-generator", label: "Hash Generator", icon: Hash, color: "from-slate-500 to-zinc-500", description: "SHA-256, SHA-1 hashing", category: "encode" },
  { id: "html-viewer", label: "HTML Viewer", icon: Eye, color: "from-pink-500 to-rose-500", description: "Render basic HTML", category: "web" },
  { id: "html-formatter", label: "HTML Formatter", icon: Code2, color: "from-fuchsia-500 to-purple-500", description: "Format HTML online", category: "web" },
  { id: "css-minifier", label: "CSS Minifier", icon: Minimize2, color: "from-blue-500 to-indigo-500", description: "Minify & compress CSS", category: "web" },
  { id: "css-gradient", label: "CSS Gradient", icon: Paintbrush, color: "from-violet-500 to-pink-500", description: "Generate CSS gradients", category: "web" },
  { id: "markdown-preview", label: "Markdown", icon: Type, color: "from-purple-500 to-indigo-500", description: "Preview markdown live", category: "web" },
  { id: "schema-checker", label: "Schema Check", icon: FileCode, color: "from-cyan-500 to-blue-500", description: "Check page schema & SEO", category: "testing" },
  { id: "amp-validator", label: "AMP Validator", icon: ShieldCheck, color: "from-amber-500 to-yellow-500", description: "Validate AMP pages", category: "testing" },
  { id: "pagespeed", label: "PageSpeed", icon: Gauge, color: "from-green-500 to-teal-500", description: "Website performance", category: "testing" },
  { id: "purge-url", label: "Purge URL", icon: Zap, color: "from-red-500 to-orange-500", description: "Purge live & alpha cache", category: "testing" },
  { id: "text-diff", label: "Diff Checker", icon: FileText, color: "from-orange-500 to-red-500", description: "Compare text & code", category: "utility" },
  { id: "timestamp", label: "Timestamp", icon: Clock, color: "from-amber-500 to-orange-500", description: "Unix ↔ datetime convert", category: "utility" },
  { id: "uuid-generator", label: "UUID Generator", icon: Fingerprint, color: "from-indigo-500 to-violet-500", description: "Generate v4 UUIDs", category: "utility" },
  { id: "color-converter", label: "Color Converter", icon: Palette, color: "from-green-500 to-emerald-500", description: "HEX, RGB, HSL convert", category: "utility" },
] as const;

type ToolId = (typeof tools)[number]["id"];

const toolComponents: Record<ToolId, React.FC> = {
  "api-collection": ApiCollectionManager,
  "json-viewer": JsonViewer,
  "password-generator": PasswordGenerator,
  base64: Base64Tool,
  "url-encoder": UrlEncoder,
  "text-diff": TextDiff,
  "jwt-decoder": JwtDecoder,
  "schema-checker": SchemaChecker,
  "html-viewer": HtmlViewer,
  "html-formatter": HtmlFormatter,
  "css-minifier": CssMinifier,
  "css-gradient": CssGradientGenerator,
  "purge-url": PurgeUrl,
  "amp-validator": AmpValidator,
  pagespeed: PageSpeed,
  timestamp: TimestampConverter,
  "uuid-generator": UuidGenerator,
  "markdown-preview": MarkdownPreview,
  "color-converter": ColorConverter,
  "hash-generator": HashGenerator,
};

export default function DashboardPage() {
  const { user } = useUser();
  const displayName = user?.displayName?.split(" ")[0] || "there";
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [communityOpen, setCommunityOpen] = useState(true);

  const filteredTools = activeCategory === "all" ? tools : tools.filter((t) => t.category === activeCategory);
  const ActiveComponent = activeTool ? toolComponents[activeTool] : null;
  const activeToolMeta = activeTool ? tools.find((t) => t.id === activeTool) : null;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-accent/90 p-6 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white/80">{getGreeting()}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{displayName}</h1>
          <p className="mt-1 text-white/70 text-sm">Your developer toolbox — pick a tool below to get started.</p>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Category Tabs */}
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

      {/* Tool Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredTools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(isActive ? null : tool.id)}
              className={cn(
                "group relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all duration-200",
                isActive
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-110",
                tool.color
              )}>
                <tool.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold leading-tight">{tool.label}</span>
              <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{tool.description}</span>
              {isActive && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/60 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tool Panel */}
      {ActiveComponent && activeToolMeta && (
        <div className="animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br text-white", activeToolMeta.color)}>
              <activeToolMeta.icon className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold">{activeToolMeta.label}</h2>
            <button
              onClick={() => setActiveTool(null)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
          <ActiveComponent />
        </div>
      )}


      {/* Community Section - Collapsible */}
      <Collapsible open={communityOpen} onOpenChange={setCommunityOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-4 rounded-xl border border-border/50 bg-card px-5 py-4 text-left transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex -space-x-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/10 text-pink-500"><Cake className="h-4 w-4" /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500"><Award className="h-4 w-4" /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500"><Lightbulb className="h-4 w-4" /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><CalendarDays className="h-4 w-4" /></span>
              </div>
              <span className="text-base font-semibold">Team Corner</span>
              <span className="text-sm text-muted-foreground">Birthdays, Achievements, Ideas & Events</span>
            </div>
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", communityOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4">

            {/* Row 1: Birthdays (left, wider) + Special Announcements (right, compact) */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_300px]">
              <BirthdayCorner />
              <SpecialAnnouncementsCorner />
            </div>

            <div className="border-t border-border/40" />

            {/* Row 2: Achievements + Recognition */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <AchievementsCorner />
              <RecognitionCorner />
            </div>

            <div className="border-t border-border/40" />

            {/* Row 3: Ideas */}
            <IdeasCorner />

            <div className="border-t border-border/40" />

            {/* Row 4: Events */}
            <OrganizeEvent />

          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
