"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface State { hasError: boolean; message: string }

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("AppErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground mt-1">{this.state.message || "An unexpected error occurred."}</p>
            </div>
            <Button onClick={() => window.location.replace("/dashboard")} className="rounded-xl">
              Reload App
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
