"use client";

import { Button } from "@/components/ui/button";
import { Rocket, Chrome } from "lucide-react";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useUser } from "@/firebase";
import { useEffect, useRef } from "react";

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const navigating = useRef(false);

  useEffect(() => {
    if (!isUserLoading && user && !navigating.current) {
      navigating.current = true;
      window.location.replace("/dashboard");
    }
  }, [user, isUserLoading]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // navigation handled by useEffect above
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob animation-delay-0 absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4 animate-slide-up">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                ITG{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Connect
                </span>
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Your internal hub for people, ideas & culture
              </p>
            </div>
          </div>

          {/* Divider label */}
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
            Sign in to continue
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSignIn}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-base font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-90 hover:shadow-primary/50 transition-all duration-200"
            >
              <Chrome className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-600">
            By signing in you agree to our{" "}
            <span className="text-slate-400 underline underline-offset-2 cursor-pointer hover:text-white transition-colors">
              Terms
            </span>{" "}
            &{" "}
            <span className="text-slate-400 underline underline-offset-2 cursor-pointer hover:text-white transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>

        {/* Floating decoration */}
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white/20"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
