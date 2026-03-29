"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Plus, Trash2 } from "lucide-react";

interface ColorStop {
  color: string;
  position: number;
}

export function CssGradientGenerator() {
  const [stops, setStops] = useState<ColorStop[]>([
    { color: "#6366f1", position: 0 },
    { color: "#ec4899", position: 50 },
    { color: "#f59e0b", position: 100 },
  ]);
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [radialShape, setRadialShape] = useState<"circle" | "ellipse">("circle");
  const [copied, setCopied] = useState(false);

  const gradientStops = stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");

  const cssValue =
    type === "linear"
      ? `linear-gradient(${angle}deg, ${gradientStops})`
      : `radial-gradient(${radialShape}, ${gradientStops})`;

  const fullCss = `background: ${cssValue};`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateStop = (index: number, updates: Partial<ColorStop>) => {
    setStops(stops.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const addStop = () => {
    setStops([...stops, { color: "#10b981", position: 75 }]);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const presets = [
    { name: "Sunset", stops: [{ color: "#f97316", position: 0 }, { color: "#ec4899", position: 100 }] },
    { name: "Ocean", stops: [{ color: "#06b6d4", position: 0 }, { color: "#3b82f6", position: 50 }, { color: "#6366f1", position: 100 }] },
    { name: "Forest", stops: [{ color: "#22c55e", position: 0 }, { color: "#16a34a", position: 50 }, { color: "#15803d", position: 100 }] },
    { name: "Aurora", stops: [{ color: "#8b5cf6", position: 0 }, { color: "#06b6d4", position: 50 }, { color: "#10b981", position: 100 }] },
    { name: "Fire", stops: [{ color: "#ef4444", position: 0 }, { color: "#f97316", position: 50 }, { color: "#eab308", position: 100 }] },
  ];

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-pink-500" />
      <CardHeader className="pb-3">
        <CardTitle className="text-base">CSS Gradient Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="h-32 rounded-xl border border-border/50 shadow-inner" style={{ background: cssValue }} />

        {/* Type & Angle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setType("linear")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${type === "linear" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >Linear</button>
            <button
              onClick={() => setType("radial")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${type === "radial" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >Radial</button>
          </div>
          {type === "linear" ? (
            <div className="flex items-center gap-2">
              <Label className="text-[10px] text-muted-foreground">Angle:</Label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-24 accent-violet-500"
              />
              <span className="text-xs font-mono w-8">{angle}°</span>
            </div>
          ) : (
            <div className="flex items-center rounded-lg border border-border/50 overflow-hidden">
              <button
                onClick={() => setRadialShape("circle")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${radialShape === "circle" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >Circle</button>
              <button
                onClick={() => setRadialShape("ellipse")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${radialShape === "ellipse" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >Ellipse</button>
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => setStops(p.stops)}
              className="px-2 py-1 text-[10px] font-medium rounded-md border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Color Stops */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Color Stops</span>
            <Button size="sm" variant="outline" onClick={addStop} className="h-6 text-[10px] gap-1 px-2">
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="h-7 w-10 rounded border-0 cursor-pointer"
              />
              <Input
                value={stop.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="w-24 h-7 text-xs font-mono rounded-lg"
              />
              <input
                type="range"
                min={0}
                max={100}
                value={stop.position}
                onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
                className="flex-1 accent-violet-500"
              />
              <span className="text-xs font-mono w-8 text-right">{stop.position}%</span>
              <button
                onClick={() => removeStop(i)}
                disabled={stops.length <= 2}
                className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* CSS Output */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">CSS</span>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-muted/30 px-3 py-2 rounded-xl break-all border border-border/50">
              {fullCss}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopy} className="h-8 shrink-0">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
