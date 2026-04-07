"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search, ExternalLink, Loader2, History, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePageSpeedHistory } from "@/hooks/use-firestore-data";
import { useUser } from "@/firebase";
import type { PageSpeedHistory } from "@/lib/types";

interface MetricData {
  label: string;
  value: string;
  score: number;
  description: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getScoreRingColor(score: number): string {
  if (score >= 90) return "stroke-emerald-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-red-500";
}

function ScoreCircle({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={getScoreRingColor(score)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className={`absolute text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
    </div>
  );
}

// Use the Firebase project API key — quota is tied to project studio-1240945126-b5f6c
const API_KEY = "AIzaSyDfJjKOU1dHmYfL555rFuFiQGjsKJPSJeo";

export function PageSpeed() {
  const { user } = useUser();
  const { history, loading: historyLoading, addEntry, deleteEntry } = usePageSpeedHistory();
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [result, setResult] = useState<PageSpeedHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let testUrl = url.trim();
      if (!testUrl.startsWith("http")) testUrl = "https://" + testUrl;

      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&strategy=${strategy}${API_KEY ? `&key=${API_KEY}` : ""}`;

      const res = await fetch(apiUrl);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `API returned ${res.status}`);
      }

      const data = await res.json();
      const lhr = data.lighthouseResult;

      const overallScore = Math.round((lhr.categories?.performance?.score || 0) * 100);

      const audits = lhr.audits || {};
      const metrics: MetricData[] = [
        {
          label: "First Contentful Paint",
          value: audits["first-contentful-paint"]?.displayValue || "N/A",
          score: Math.round((audits["first-contentful-paint"]?.score || 0) * 100),
          description: "Time to first visible content",
        },
        {
          label: "Largest Contentful Paint",
          value: audits["largest-contentful-paint"]?.displayValue || "N/A",
          score: Math.round((audits["largest-contentful-paint"]?.score || 0) * 100),
          description: "Time to largest visible content",
        },
        {
          label: "Total Blocking Time",
          value: audits["total-blocking-time"]?.displayValue || "N/A",
          score: Math.round((audits["total-blocking-time"]?.score || 0) * 100),
          description: "Time the page was blocked from input",
        },
        {
          label: "Cumulative Layout Shift",
          value: audits["cumulative-layout-shift"]?.displayValue || "N/A",
          score: Math.round((audits["cumulative-layout-shift"]?.score || 0) * 100),
          description: "Visual stability of the page",
        },
        {
          label: "Speed Index",
          value: audits["speed-index"]?.displayValue || "N/A",
          score: Math.round((audits["speed-index"]?.score || 0) * 100),
          description: "How quickly content is visually displayed",
        },
        {
          label: "Time to Interactive",
          value: audits["interactive"]?.displayValue || "N/A",
          score: Math.round((audits["interactive"]?.score || 0) * 100),
          description: "Time until the page is fully interactive",
        },
      ];

      const entry: Omit<PageSpeedHistory, "id"> = {
        url: testUrl,
        strategy,
        overallScore,
        metrics,
        userId: user?.uid || "",
        userName: user?.displayName || user?.email || "Anonymous",
        createdAt: new Date().toISOString(),
      };

      await addEntry(entry);
      setResult({ ...entry, id: "" } as PageSpeedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const viewHistoryEntry = (entry: PageSpeedHistory) => {
    setResult(entry);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-teal-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">PageSpeed Insights</CardTitle>
          <a
            href="https://pagespeed.web.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Google PageSpeed <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="font-mono text-xs rounded-xl flex-1"
          />
          <div className="flex items-center rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setStrategy("mobile")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${strategy === "mobile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >Mobile</button>
            <button
              onClick={() => setStrategy("desktop")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${strategy === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >Desktop</button>
          </div>
          <Button size="sm" onClick={handleAnalyze} disabled={loading || !url.trim()} className="h-7 text-xs gap-1.5 bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setUrl(""); setResult(null); setError(null); }} className="h-7 text-xs gap-1.5">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Analyzing performance... this may take 15-30 seconds</p>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-destructive font-medium">{error}</p>}

        {result && !loading && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <ScoreCircle score={result.overallScore} />
              <div>
                <p className="text-sm font-semibold">Performance Score</p>
                <p className="text-xs text-muted-foreground">{result.url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] capitalize">{result.strategy}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {result.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-border/50 p-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-muted-foreground">{metric.label}</span>
                    <span className={`text-xs font-bold ${getScoreColor(metric.score)}`}>{metric.value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getScoreBg(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{metric.description}</p>
                </div>
              ))}
            </div>

            {/* Score Legend */}
            <div className="flex items-center gap-4 justify-center text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> 90-100: Good</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> 50-89: Needs Work</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> 0-49: Poor</span>
            </div>
          </div>
        )}

        {/* Firestore History */}
        {!historyLoading && history.length > 0 && !loading && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <History className="h-3 w-3" /> Test History
              </span>
              <span className="text-[10px] text-muted-foreground">{history.length} tests</span>
            </div>
            <div className="rounded-xl border border-border/50 divide-y divide-border/30 max-h-64 overflow-y-auto">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 cursor-pointer group"
                  onClick={() => viewHistoryEntry(h)}
                >
                  <span className={`text-sm font-bold min-w-[28px] text-center ${getScoreColor(h.overallScore)}`}>{h.overallScore}</span>
                  <div className="flex-1 min-w-0">
                    <code className="text-[10px] font-mono truncate block">{h.url}</code>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{h.userName}</span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2 w-2" />
                        {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] capitalize shrink-0">{h.strategy}</Badge>
                  {h.userId === user?.uid && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteEntry(h.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
