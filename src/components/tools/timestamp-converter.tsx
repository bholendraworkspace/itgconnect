"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Clock, RefreshCw } from "lucide-react";
import { format, fromUnixTime, getUnixTime, isValid, parseISO } from "date-fns";
import { formatDistanceToNow } from "date-fns";

export function TimestampConverter() {
  const [unixTimestamp, setUnixTimestamp] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const setNow = useCallback(() => {
    const now = new Date();
    setUnixTimestamp(getUnixTime(now).toString());
    setDateTime(format(now, "yyyy-MM-dd'T'HH:mm:ss"));
  }, []);

  useEffect(() => { setNow(); }, [setNow]);

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tsValue = e.target.value;
    setUnixTimestamp(tsValue);
    const numTs = parseInt(tsValue, 10);
    if (!isNaN(numTs) && tsValue.length > 0) {
      // Auto-detect milliseconds vs seconds
      const ts = numTs > 9999999999 ? Math.floor(numTs / 1000) : numTs;
      const date = fromUnixTime(ts);
      if (isValid(date)) {
        setDateTime(format(date, "yyyy-MM-dd'T'HH:mm:ss"));
      }
    } else if (tsValue === "") {
      setDateTime("");
    }
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dtValue = e.target.value;
    setDateTime(dtValue);
    const date = parseISO(dtValue);
    if (isValid(date)) {
      setUnixTimestamp(getUnixTime(date).toString());
    } else if (dtValue === "") {
      setUnixTimestamp("");
    }
  };

  const handleCopy = async (value: string, field: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const currentDate = unixTimestamp
    ? fromUnixTime(parseInt(unixTimestamp) > 9999999999 ? Math.floor(parseInt(unixTimestamp) / 1000) : parseInt(unixTimestamp))
    : null;
  const isValidDate = currentDate && isValid(currentDate);
  const msTimestamp = unixTimestamp ? (parseInt(unixTimestamp) > 9999999999 ? unixTimestamp : (parseInt(unixTimestamp) * 1000).toString()) : "";
  const relativeTime = isValidDate ? formatDistanceToNow(currentDate, { addSuffix: true }) : "";

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Timestamp Converter</CardTitle>
          <Button size="sm" variant="outline" onClick={setNow} className="h-7 text-xs gap-1.5">
            <RefreshCw className="h-3 w-3" /> Now
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main conversion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timestamp" className="text-xs font-medium">Unix Timestamp (seconds)</Label>
            <div className="flex gap-1.5">
              <Input
                id="timestamp"
                placeholder="e.g., 1672531200"
                value={unixTimestamp}
                onChange={handleTimestampChange}
                className="font-mono text-sm"
              />
              <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => handleCopy(unixTimestamp, "ts")}>
                {copiedField === "ts" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="datetime" className="text-xs font-medium">Date & Time (Local)</Label>
            <div className="flex gap-1.5">
              <Input
                id="datetime"
                value={dateTime}
                onChange={handleDateTimeChange}
                type="datetime-local"
                step="1"
                className="text-sm"
              />
              <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => handleCopy(dateTime, "dt")}>
                {copiedField === "dt" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Derived formats */}
        {isValidDate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FormatBlock label="Milliseconds" value={msTimestamp} onCopy={handleCopy} field="ms" copiedField={copiedField} />
            <FormatBlock label="ISO 8601" value={currentDate.toISOString()} onCopy={handleCopy} field="iso" copiedField={copiedField} />
            <FormatBlock label="UTC" value={currentDate.toUTCString()} onCopy={handleCopy} field="utc" copiedField={copiedField} />
            <FormatBlock label="Relative" value={relativeTime} onCopy={handleCopy} field="rel" copiedField={copiedField} icon />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FormatBlock({ label, value, onCopy, field, copiedField, icon }: {
  label: string; value: string; onCopy: (v: string, f: string) => void; field: string; copiedField: string | null; icon?: boolean;
}) {
  return (
    <div className="rounded-xl bg-muted/30 border border-border/50 px-3 py-2.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon && <Clock className="h-3 w-3 text-amber-500 shrink-0" />}
        <span className="text-xs font-mono truncate flex-1">{value}</span>
        <button onClick={() => onCopy(value, field)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          {copiedField === field ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
