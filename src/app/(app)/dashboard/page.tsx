"use client";

import { BirthdayCorner, SpecialAnnouncementsCorner } from "@/components/dashboard/corners";
import { AchievementsCorner, RecognitionCorner } from "@/components/dashboard/achievements";
import { IdeasCorner } from "@/components/dashboard/ideas";
import { OrganizeEvent } from "@/components/dashboard/events";
import { useUser } from "@/firebase";
import { Sparkles } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useUser();
  const displayName = user?.displayName?.split(" ")[0] || (user?.isAnonymous ? "Guest" : "there");

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-rose-500 to-accent p-6 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white/80">{getGreeting()}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{displayName} 👋</h1>
          <p className="mt-1 text-white/70 text-sm">Here's what's happening at ITG today.</p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-white/10" />
      </div>

      {/* Birthday + Announcements */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2"><BirthdayCorner /></div>
        <div className="lg:col-span-1"><SpecialAnnouncementsCorner /></div>
      </div>

      {/* Achievements + Recognition */}
      <div className="grid gap-6 md:grid-cols-2">
        <AchievementsCorner />
        <RecognitionCorner />
      </div>

      {/* Ideas + Events */}
      <div className="grid gap-6">
        <IdeasCorner />
        <OrganizeEvent />
      </div>
    </div>
  );
}
