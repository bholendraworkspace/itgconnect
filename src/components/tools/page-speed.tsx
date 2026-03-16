"use client";

import { usePageInsights } from "@/hooks/use-firestore-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gauge, Monitor, Smartphone, GitCommit, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { PageInsightScores } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Score helpers ──────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-500 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function scoreBg(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function scoreBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 90) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

// ── Circular score gauge ───────────────────────────────────────────────────────
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor"
            className="text-muted/30" strokeWidth="6" />
          <circle cx="36" cy="36" r={r} fill="none"
            className={cn(
              score >= 90 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500"
            )}
            strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-lg font-bold", scoreColor(score))}>
          {score}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground text-center leading-tight font-medium">{label}</span>
    </div>
  );
}

// ── Score card for a strategy ─────────────────────────────────────────────────
function ScorePanel({ scores }: { scores: PageInsightScores }) {
  const metrics = [
    { key: "performance",   label: "Performance" },
    { key: "accessibility", label: "Accessibility" },
    { key: "bestPractices", label: "Best Practices" },
    { key: "seo",           label: "SEO" },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4">
      {metrics.map(({ key, label }) => (
        <ScoreGauge key={key} score={scores[key]} label={label} />
      ))}
    </div>
  );
}

// ── History row ────────────────────────────────────────────────────────────────
function HistoryRow({ insight, index }: { insight: import("@/lib/types").PageInsight; index: number }) {
  const avg = (s: PageInsightScores) =>
    Math.round((s.performance + s.accessibility + s.bestPractices + s.seo) / 4);

  const mAvg = avg(insight.mobile);
  const dAvg = avg(insight.desktop);

  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-xl transition-colors",
      index % 2 === 0 ? "bg-muted/30" : ""
    )}>
      {/* Date + commit */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">
          {format(new Date(insight.date), "MMM d, yyyy · HH:mm")}
        </span>
        <div className="flex items-center gap-1 ml-2">
          <GitCommit className="h-3 w-3 text-muted-foreground" />
          <code className="text-[10px] font-mono text-muted-foreground">{insight.commitSha}</code>
        </div>
      </div>

      {/* Mobile score */}
      <div className="flex items-center gap-1.5">
        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
        <Badge variant={scoreBadgeVariant(mAvg)} className="text-xs font-bold px-2">
          {mAvg}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          P:{insight.mobile.performance} A:{insight.mobile.accessibility} B:{insight.mobile.bestPractices} S:{insight.mobile.seo}
        </span>
      </div>

      {/* Desktop score */}
      <div className="flex items-center gap-1.5">
        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
        <Badge variant={scoreBadgeVariant(dAvg)} className="text-xs font-bold px-2">
          {dAvg}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          P:{insight.desktop.performance} A:{insight.desktop.accessibility} B:{insight.desktop.bestPractices} S:{insight.desktop.seo}
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function PageSpeedReport() {
  const { insights, loading } = usePageInsights();
  const latest = insights[0];

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500" />
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <CardTitle>Page Speed Insights</CardTitle>
          </div>
          <a
            href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent("https://studio-1240945126-b5f6c.web.app/login")}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Run on PageSpeed
          </a>
        </div>
        <CardDescription>
          Scores auto-captured after every deploy. History kept in Firestore.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : !latest ? (
          <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
            <Gauge className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No data yet. Push to main to trigger the first report.</p>
          </div>
        ) : (
          <>
            {/* Latest scores */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold">Latest Report</p>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(latest.date), "MMM d · HH:mm")}
                </Badge>
                <div className="flex items-center gap-1">
                  <GitCommit className="h-3 w-3 text-muted-foreground" />
                  <code className="text-[10px] font-mono text-muted-foreground">{latest.commitSha}</code>
                </div>
              </div>

              <Tabs defaultValue="mobile">
                <TabsList className="h-8">
                  <TabsTrigger value="mobile" className="text-xs gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                  </TabsTrigger>
                  <TabsTrigger value="desktop" className="text-xs gap-1.5">
                    <Monitor className="h-3.5 w-3.5" /> Desktop
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="mobile"><ScorePanel scores={latest.mobile} /></TabsContent>
                <TabsContent value="desktop"><ScorePanel scores={latest.desktop} /></TabsContent>
              </Tabs>
            </div>

            {/* Score legend */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> 90–100 Good</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" /> 50–89 Needs work</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> 0–49 Poor</div>
            </div>

            {/* History */}
            {insights.length > 1 && (
              <div>
                <p className="text-sm font-semibold mb-2">History ({insights.length} runs)</p>
                <div className="space-y-0.5 max-h-72 overflow-y-auto rounded-xl border border-border/50">
                  {insights.map((insight, i) => (
                    <HistoryRow key={insight.id} insight={insight} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
