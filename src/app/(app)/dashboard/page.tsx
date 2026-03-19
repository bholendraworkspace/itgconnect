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
import { RegexTester } from "@/components/tools/regex-tester";
import { ColorConverter } from "@/components/tools/color-converter";
import { HashGenerator } from "@/components/tools/hash-generator";
import { TextDiff } from "@/components/tools/text-diff";
import { MarkdownPreview } from "@/components/tools/markdown-preview";
import { LoremGenerator } from "@/components/tools/lorem-generator";
import { CronParser } from "@/components/tools/cron-parser";
import { ApiCollectionManager } from "@/components/tools/api-collection";
import { cn } from "@/lib/utils";
import {
  Braces,
  Binary,
  Clock,
  Link2,
  Fingerprint,
  KeyRound,
  Regex,
  Palette,
  Hash,
  Terminal,
  ChevronDown,
  Cake,
  Award,
  Lightbulb,
  CalendarDays,
  FileText,
  Type,
  AlignLeft,
  Timer,
  BookOpen,
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

const tools = [
  { id: "api-collection", label: "API Collections", icon: BookOpen, color: "from-violet-500 to-fuchsia-500", description: "Import & browse API docs" },
  { id: "json-viewer", label: "JSON Formatter", icon: Braces, color: "from-blue-500 to-cyan-500", description: "Format, validate & minify" },
  { id: "jwt-decoder", label: "JWT Decoder", icon: KeyRound, color: "from-yellow-500 to-amber-500", description: "Decode & inspect tokens" },
  { id: "regex-tester", label: "Regex Tester", icon: Regex, color: "from-fuchsia-500 to-pink-500", description: "Test regex with matches" },
  { id: "base64", label: "Base64", icon: Binary, color: "from-emerald-500 to-teal-500", description: "Encode & decode strings" },
  { id: "timestamp", label: "Timestamp", icon: Clock, color: "from-amber-500 to-orange-500", description: "Unix ↔ datetime convert" },
  { id: "text-diff", label: "Text Diff", icon: FileText, color: "from-orange-500 to-red-500", description: "Compare two texts" },
  { id: "url-encoder", label: "URL Encoder", icon: Link2, color: "from-sky-500 to-blue-500", description: "Encode & decode URLs" },
  { id: "uuid-generator", label: "UUID Generator", icon: Fingerprint, color: "from-indigo-500 to-violet-500", description: "Generate v4 UUIDs" },
  { id: "markdown-preview", label: "Markdown", icon: Type, color: "from-purple-500 to-indigo-500", description: "Preview markdown live" },
  { id: "cron-parser", label: "Cron Parser", icon: Timer, color: "from-cyan-500 to-blue-500", description: "Parse cron expressions" },
  { id: "color-converter", label: "Color Converter", icon: Palette, color: "from-green-500 to-emerald-500", description: "HEX, RGB, HSL convert" },
  { id: "hash-generator", label: "Hash Generator", icon: Hash, color: "from-slate-500 to-zinc-500", description: "SHA-256, SHA-1 hashing" },
  { id: "lorem-generator", label: "Lorem Ipsum", icon: AlignLeft, color: "from-lime-500 to-green-500", description: "Generate placeholder text" },
] as const;

type ToolId = (typeof tools)[number]["id"];

const toolComponents: Record<ToolId, React.FC> = {
  "api-collection": ApiCollectionManager,
  "json-viewer": JsonViewer,
  "jwt-decoder": JwtDecoder,
  "regex-tester": RegexTester,
  base64: Base64Tool,
  timestamp: TimestampConverter,
  "text-diff": TextDiff,
  "url-encoder": UrlEncoder,
  "uuid-generator": UuidGenerator,
  "markdown-preview": MarkdownPreview,
  "cron-parser": CronParser,
  "color-converter": ColorConverter,
  "hash-generator": HashGenerator,
  "lorem-generator": LoremGenerator,
};

export default function DashboardPage() {
  const { user } = useUser();
  const displayName = user?.displayName?.split(" ")[0] || "there";
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [communityOpen, setCommunityOpen] = useState(true);

  const ActiveComponent = activeTool ? toolComponents[activeTool] : null;
  const activeToolMeta = activeTool ? tools.find((t) => t.id === activeTool) : null;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-white/70">{getGreeting()}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{displayName} <span className="text-emerald-400">_</span></h1>
          <p className="mt-1 text-white/50 text-sm">Your developer toolbox — pick a tool below to get started.</p>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0h40v1H0zm0 39h40v1H0z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(isActive ? null : tool.id)}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-200",
                isActive
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border-border/50 bg-card hover:border-primary/30 hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md transition-transform duration-200 group-hover:scale-110",
                tool.color
              )}>
                <tool.icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold leading-tight">{tool.label}</span>
              <span className="text-[9px] text-muted-foreground leading-tight hidden sm:block">{tool.description}</span>
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
          <button className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex -space-x-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/10 text-pink-500"><Cake className="h-3 w-3" /></span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-500"><Award className="h-3 w-3" /></span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-500"><Lightbulb className="h-3 w-3" /></span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><CalendarDays className="h-3 w-3" /></span>
              </div>
              <span className="text-sm font-semibold">Team Corner</span>
              <span className="text-xs text-muted-foreground">Birthdays, Achievements, Ideas & Events</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", communityOpen && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4">

            {/* Row 1: Birthdays (left, wider) + Special Announcements (right, compact) */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_260px]">
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
