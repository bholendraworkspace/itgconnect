import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/lib/data";
import { format } from "date-fns";
import { Award, Edit, Mail, Building, Star, CalendarDays } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ProfilePage() {
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl mx-auto">
      {/* Profile hero card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Banner */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-primary via-rose-500 to-accent">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-8 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        </div>

        <CardContent className="px-4 sm:px-6 pb-6">
          {/* Avatar + Edit row */}
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-xl ring-2 ring-primary/20">
              <AvatarImage src={currentUser.profilePhotoUrl} data-ai-hint={currentUser.profilePhotoHint} />
              <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button asChild variant="outline" size="sm" className="mb-1 rounded-xl gap-2">
              <Link href="/profile/edit">
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </Link>
            </Button>
          </div>

          {/* Name + meta */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentUser.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.department && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  <span>{currentUser.department}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Achievements", value: currentUser.achievements.length, icon: <Award className="h-4 w-4 text-amber-500" /> },
              { label: "Recognitions", value: "2", icon: <Star className="h-4 w-4 text-primary" /> },
              { label: "Member Since", value: "2022", icon: <CalendarDays className="h-4 w-4 text-blue-500" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center rounded-xl bg-muted/40 px-3 py-3 text-center">
                <div className="mb-1">{stat.icon}</div>
                <p className="text-lg font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
        <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">My Achievements</CardTitle>
              <CardDescription className="text-xs">Your accomplishments at ITG</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-5">
          {currentUser.achievements.length > 0 ? (
            <div className="space-y-3">
              {currentUser.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold leading-snug">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs border-amber-200 text-amber-700 bg-amber-50">
                    {format(new Date(achievement.date), "MMM yyyy")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <Award className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No achievements recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
