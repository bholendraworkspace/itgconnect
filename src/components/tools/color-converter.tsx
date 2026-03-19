"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function ColorConverter() {
  const [hex, setHex] = useState("#3b82f6");
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const [h, setH] = useState(217);
  const [s, setS] = useState(91);
  const [l, setL] = useState(60);
  const [copied, setCopied] = useState<string | null>(null);

  const updateFromHex = (hexVal: string) => {
    setHex(hexVal);
    const rgb = hexToRgb(hexVal);
    if (rgb) {
      setR(rgb.r); setG(rgb.g); setB(rgb.b);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setH(hsl.h); setS(hsl.s); setL(hsl.l);
    }
  };

  const updateFromRgb = (nr: number, ng: number, nb: number) => {
    setR(nr); setG(ng); setB(nb);
    setHex(rgbToHex(nr, ng, nb));
    const hsl = rgbToHsl(nr, ng, nb);
    setH(hsl.h); setS(hsl.s); setL(hsl.l);
  };

  const updateFromHsl = (nh: number, ns: number, nl: number) => {
    setH(nh); setS(ns); setL(nl);
    const rgb = hslToRgb(nh, ns, nl);
    setR(rgb.r); setG(rgb.g); setB(rgb.b);
    setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const hexStr = hex.startsWith("#") ? hex : `#${hex}`;
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-500" />
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Color Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color preview */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl border shadow-inner shrink-0" style={{ backgroundColor: hexStr }} />
          <input
            type="color"
            value={hexStr}
            onChange={(e) => updateFromHex(e.target.value)}
            className="h-10 w-10 rounded cursor-pointer border-0 bg-transparent"
          />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <CopyRow label="HEX" value={hexStr} onCopy={handleCopy} field="hex" copiedField={copied} />
            <CopyRow label="RGB" value={rgbStr} onCopy={handleCopy} field="rgb" copiedField={copied} />
            <CopyRow label="HSL" value={hslStr} onCopy={handleCopy} field="hsl" copiedField={copied} />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* HEX */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">HEX</Label>
            <Input
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="font-mono text-sm"
              spellCheck={false}
            />
          </div>

          {/* RGB */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">RGB</Label>
            <div className="flex gap-1.5">
              <Input type="number" min={0} max={255} value={r} onChange={(e) => updateFromRgb(+e.target.value, g, b)} className="text-sm font-mono" placeholder="R" />
              <Input type="number" min={0} max={255} value={g} onChange={(e) => updateFromRgb(r, +e.target.value, b)} className="text-sm font-mono" placeholder="G" />
              <Input type="number" min={0} max={255} value={b} onChange={(e) => updateFromRgb(r, g, +e.target.value)} className="text-sm font-mono" placeholder="B" />
            </div>
          </div>

          {/* HSL */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">HSL</Label>
            <div className="flex gap-1.5">
              <Input type="number" min={0} max={360} value={h} onChange={(e) => updateFromHsl(+e.target.value, s, l)} className="text-sm font-mono" placeholder="H" />
              <Input type="number" min={0} max={100} value={s} onChange={(e) => updateFromHsl(h, +e.target.value, l)} className="text-sm font-mono" placeholder="S" />
              <Input type="number" min={0} max={100} value={l} onChange={(e) => updateFromHsl(h, s, +e.target.value)} className="text-sm font-mono" placeholder="L" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CopyRow({ label, value, onCopy, field, copiedField }: {
  label: string; value: string; onCopy: (v: string, f: string) => void; field: string; copiedField: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-7">{label}</span>
      <code className="text-xs font-mono flex-1 truncate">{value}</code>
      <button onClick={() => onCopy(value, field)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
        {copiedField === field ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}
