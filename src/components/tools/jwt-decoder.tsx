"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check, AlertCircle, Trash2 } from "lucide-react";

const exampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

interface JwtPayload {
  iat?: number;
  exp?: number;
  nbf?: number;
  [key: string]: unknown;
}

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: JwtPayload;
  signature: string;
}

function decodeJwt(token: string): DecodedJwt | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { header, payload, signature: parts[2] };
  } catch {
    return null;
  }
}

function formatTimestamp(ts: number): string {
  try {
    return new Date(ts * 1000).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(ts);
  }
}

export function JwtDecoder() {
  const [token, setToken] = useState(exampleJwt);
  const [copied, setCopied] = useState<string | null>(null);

  const decoded = token.trim() ? decodeJwt(token) : null;
  const isValid = token.trim() === "" || decoded !== null;

  const isExpired = decoded?.payload?.exp != null ? decoded.payload.exp * 1000 < Date.now() : false;

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-yellow-500 to-amber-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">JWT Decoder</CardTitle>
          <div className="flex items-center gap-1.5">
            {decoded && <Badge variant="default" className="text-[10px] bg-emerald-500">Valid JWT</Badge>}
            {decoded && isExpired && <Badge variant="destructive" className="text-[10px]">Expired</Badge>}
            {!isValid && <Badge variant="destructive" className="text-[10px]">Invalid</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setToken("")} disabled={!token} className="h-7 text-xs gap-1.5 ml-auto">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>

        <Textarea
          placeholder="Paste JWT token here (eyJhbGci...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="h-24 font-mono text-xs rounded-xl resize-none"
          spellCheck={false}
        />

        {!isValid && token.trim() && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Could not decode — make sure the token has three Base64URL-encoded parts separated by dots.</span>
          </div>
        )}

        {decoded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Header */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Header</p>
                <button onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), "header")} className="text-muted-foreground hover:text-foreground">
                  {copied === "header" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <ScrollArea className="h-36 rounded-xl border bg-red-500/5 p-3">
                <pre className="text-xs font-mono">{JSON.stringify(decoded.header, null, 2)}</pre>
              </ScrollArea>
            </div>

            {/* Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Payload</p>
                <button onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), "payload")} className="text-muted-foreground hover:text-foreground">
                  {copied === "payload" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <ScrollArea className="h-36 rounded-xl border bg-violet-500/5 p-3">
                <pre className="text-xs font-mono">{JSON.stringify(decoded.payload, null, 2)}</pre>
              </ScrollArea>
            </div>

            {/* Claim details */}
            {(decoded.payload.iat != null || decoded.payload.exp != null || decoded.payload.nbf != null) && (
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {decoded.payload.iat != null && (
                  <div className="rounded-xl bg-muted/30 border border-border/50 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Issued At (iat)</p>
                    <p className="text-xs font-mono mt-0.5">{formatTimestamp(decoded.payload.iat)}</p>
                  </div>
                )}
                {decoded.payload.exp != null && (
                  <div className={`rounded-xl border px-3 py-2 ${isExpired ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border/50"}`}>
                    <p className="text-[10px] text-muted-foreground uppercase">Expires (exp)</p>
                    <p className="text-xs font-mono mt-0.5">{formatTimestamp(decoded.payload.exp)}</p>
                  </div>
                )}
                {decoded.payload.nbf != null && (
                  <div className="rounded-xl bg-muted/30 border border-border/50 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Not Before (nbf)</p>
                    <p className="text-xs font-mono mt-0.5">{formatTimestamp(decoded.payload.nbf)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
