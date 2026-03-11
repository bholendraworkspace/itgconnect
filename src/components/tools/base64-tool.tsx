"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

export function Base64Tool() {
  const [input, setInput] = useState("Hello, ITG Connect!");
  const [output, setOutput] = useState("SGVsbG8sIElURyBDb25uZWN0IQ==");

  const handleEncode = () => {
    try {
      setOutput(btoa(input));
    } catch (e) {
      setOutput("Error: Could not encode input.");
    }
  };

  const handleDecode = () => {
    try {
      setOutput(atob(input));
    } catch (e) {
      setOutput("Error: Invalid Base64 string.");
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Base64 Encoder/Decoder</CardTitle>
        <CardDescription>
          Encode or decode text to and from Base64.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Textarea
              placeholder="Input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-64 font-mono"
              aria-label="Input"
            />
            <Button variant="ghost" size="icon" onClick={handleSwap} aria-label="Swap input and output">
                <ArrowLeftRight className="h-5 w-5"/>
            </Button>
            <Textarea
              placeholder="Output"
              value={output}
              readOnly
              className="h-64 font-mono bg-muted/50"
              aria-label="Output"
            />
        </div>
        <div className="flex gap-4">
          <Button onClick={handleEncode}>Encode</Button>
          <Button onClick={handleDecode} variant="secondary">Decode</Button>
        </div>
      </CardContent>
    </Card>
  );
}
