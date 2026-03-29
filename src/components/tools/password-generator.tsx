"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, RefreshCw } from "lucide-react";

export function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    let chars = "";
    if (options.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (options.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.numbers) chars += "0123456789";
    if (options.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) return;
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const pw = Array.from(array, (x) => chars[x % chars.length]).join("");
    setPassword(pw);
    setHistory((prev) => [pw, ...prev.slice(0, 9)]);
  }, [length, options]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = (() => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (options.uppercase) score++;
    if (options.lowercase) score++;
    if (options.numbers) score++;
    if (options.symbols) score++;
    if (score <= 2) return { label: "Weak", color: "text-red-500", bg: "bg-red-500" };
    if (score <= 4) return { label: "Medium", color: "text-yellow-500", bg: "bg-yellow-500" };
    return { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" };
  })();

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-pink-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Random Password Generator</CardTitle>
          {password && <Badge variant="outline" className="text-[10px]">{password.length} chars</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generated password */}
        <div className="flex items-center gap-2">
          <Input
            value={password}
            readOnly
            placeholder="Click generate..."
            className="font-mono text-sm rounded-xl bg-muted/30"
          />
          <Button size="sm" variant="outline" onClick={() => handleCopy(password)} disabled={!password} className="h-9 shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={generate} className="h-9 shrink-0 bg-rose-600 hover:bg-rose-700 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Generate
          </Button>
        </div>

        {/* Strength meter */}
        {password && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Strength</span>
              <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.bg}`}
                style={{ width: strength.label === "Weak" ? "33%" : strength.label === "Medium" ? "66%" : "100%" }}
              />
            </div>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Length: {length}</Label>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
          {(["uppercase", "lowercase", "numbers", "symbols"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options[opt]}
                onChange={(e) => setOptions({ ...options, [opt]: e.target.checked })}
                className="rounded accent-rose-500"
              />
              <span className="text-xs capitalize">{opt}</span>
            </label>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent</span>
              <Button size="sm" variant="ghost" onClick={() => setHistory([])} className="h-5 text-[10px] px-1.5">Clear</Button>
            </div>
            <div className="rounded-xl border border-border/50 divide-y divide-border/30 max-h-32 overflow-y-auto">
              {history.map((pw, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 hover:bg-muted/30 group">
                  <code className="text-[11px] font-mono truncate flex-1">{pw}</code>
                  <button onClick={() => handleCopy(pw)} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
