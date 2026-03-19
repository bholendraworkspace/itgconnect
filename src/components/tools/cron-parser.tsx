"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Clock } from "lucide-react";

const FIELD_NAMES = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"];
const FIELD_RANGES = ["0-59", "0-23", "1-31", "1-12", "0-6 (Sun=0)"];

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every day at 9 AM", cron: "0 9 * * *" },
  { label: "Every Monday at 9 AM", cron: "0 9 * * 1" },
  { label: "Every weekday at 9 AM", cron: "0 9 * * 1-5" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every 30 minutes", cron: "*/30 * * * *" },
  { label: "First day of month at midnight", cron: "0 0 1 * *" },
  { label: "Every Sunday at 3 AM", cron: "0 3 * * 0" },
  { label: "Twice daily (9 AM and 5 PM)", cron: "0 9,17 * * *" },
];

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function describeField(value: string, fieldIndex: number): string {
  if (value === "*") return `every ${FIELD_NAMES[fieldIndex].toLowerCase()}`;

  if (value.startsWith("*/")) {
    const step = value.slice(2);
    return `every ${step} ${FIELD_NAMES[fieldIndex].toLowerCase()}${parseInt(step) > 1 ? "s" : ""}`;
  }

  if (value.includes(",")) {
    const parts = value.split(",").map((v) => formatFieldValue(v.trim(), fieldIndex));
    return parts.join(", ");
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `${formatFieldValue(start, fieldIndex)} through ${formatFieldValue(end, fieldIndex)}`;
  }

  return formatFieldValue(value, fieldIndex);
}

function formatFieldValue(value: string, fieldIndex: number): string {
  const num = parseInt(value);
  if (isNaN(num)) return value;
  if (fieldIndex === 3 && num >= 1 && num <= 12) return MONTHS[num];
  if (fieldIndex === 4 && num >= 0 && num <= 6) return DAYS[num];
  if (fieldIndex === 0) return `minute ${num}`;
  if (fieldIndex === 1) {
    const ampm = num >= 12 ? "PM" : "AM";
    const h = num === 0 ? 12 : num > 12 ? num - 12 : num;
    return `${h}:00 ${ampm}`;
  }
  if (fieldIndex === 2) return `day ${num}`;
  return value;
}

function describeCron(expression: string): { description: string; fields: string[]; error: string | null } {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { description: "", fields: [], error: `Expected 5 fields, got ${parts.length}. Format: minute hour day-of-month month day-of-week` };
  }

  const fields = parts.map((p, i) => describeField(p, i));

  let description = "Runs ";
  const [min, hour, dom, month, dow] = parts;

  if (expression === "* * * * *") {
    description = "Runs every minute";
  } else if (min.startsWith("*/")) {
    description = `Runs ${describeField(min, 0)}`;
  } else {
    const timeParts: string[] = [];
    if (min !== "*") timeParts.push(`at minute ${min}`);
    if (hour !== "*") {
      const h = parseInt(hour);
      if (!isNaN(h)) {
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        timeParts.push(`at ${h12}:${min.padStart(2, "0")} ${ampm}`);
      } else {
        timeParts.push(`at hour ${hour}`);
      }
    }
    description = `Runs ${timeParts.join(" ")}`;
  }

  if (dow !== "*") description += `, on ${describeField(dow, 4)}`;
  if (dom !== "*") description += `, on ${describeField(dom, 2)}`;
  if (month !== "*") description += `, in ${describeField(month, 3)}`;

  return { description, fields, error: null };
}

function getNextRuns(expression: string, count: number = 5): Date[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const results: Date[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  const maxIterations = 525960; // ~1 year of minutes
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    if (matchesCron(check, parts)) {
      results.push(new Date(check));
    }
    check.setMinutes(check.getMinutes() + 1);
    iterations++;
  }

  return results;
}

function matchesCron(date: Date, parts: string[]): boolean {
  const [min, hour, dom, month, dow] = parts;
  return (
    matchField(date.getMinutes(), min) &&
    matchField(date.getHours(), hour) &&
    matchField(date.getDate(), dom) &&
    matchField(date.getMonth() + 1, month) &&
    matchField(date.getDay(), dow)
  );
}

function matchField(value: number, pattern: string): boolean {
  if (pattern === "*") return true;
  if (pattern.startsWith("*/")) {
    const step = parseInt(pattern.slice(2));
    return value % step === 0;
  }
  if (pattern.includes(",")) {
    return pattern.split(",").some((p) => matchField(value, p.trim()));
  }
  if (pattern.includes("-")) {
    const [start, end] = pattern.split("-").map(Number);
    return value >= start && value <= end;
  }
  return value === parseInt(pattern);
}

export function CronParser() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [copied, setCopied] = useState(false);

  const { description, fields, error } = useMemo(() => describeCron(expression), [expression]);
  const nextRuns = useMemo(() => (error ? [] : getNextRuns(expression)), [expression, error]);
  const parts = expression.trim().split(/\s+/);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Cron Expression Parser</CardTitle>
          <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs gap-1.5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="* * * * *"
            className="font-mono text-lg text-center tracking-[0.3em] h-12"
            spellCheck={false}
          />

          {/* Field labels */}
          <div className="grid grid-cols-5 gap-1 text-center">
            {FIELD_NAMES.map((name, i) => (
              <div key={name} className="space-y-0.5">
                <p className={`text-xs font-mono font-bold ${parts[i] && parts[i] !== "*" ? "text-primary" : "text-muted-foreground/50"}`}>
                  {parts[i] || "*"}
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight">{name}</p>
                <p className="text-[8px] text-muted-foreground/50">{FIELD_RANGES[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-destructive font-medium">{error}</p>}

        {!error && description && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
            <p className="text-sm font-medium">{description}</p>
          </div>
        )}

        {/* Presets */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.cron}
                onClick={() => setExpression(preset.cron)}
                className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${expression === preset.cron ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Next runs */}
        {nextRuns.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Next 5 Runs</p>
            <div className="rounded-xl border border-border/50 divide-y divide-border/30">
              {nextRuns.map((date, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 text-xs">
                  <Clock className="h-3 w-3 text-cyan-500 shrink-0" />
                  <span className="font-mono">
                    {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    {" "}
                    {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Field breakdown */}
        {!error && fields.length === 5 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Field Breakdown</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {fields.map((f, i) => (
                <div key={i} className="rounded-lg bg-muted/30 border border-border/50 px-3 py-2">
                  <p className="text-[9px] text-muted-foreground uppercase">{FIELD_NAMES[i]}</p>
                  <p className="text-xs font-medium mt-0.5 capitalize">{f}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
