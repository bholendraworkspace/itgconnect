"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Award, Trophy, Loader2 } from "lucide-react";
import { useAchievements } from "@/hooks/use-firestore-data";

export default function AchievementsPage() {
  const { achievements, loading } = useAchievements();

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm"><Trophy className="h-4 w-4" /></div>
            <span className="text-sm font-medium text-muted-foreground">Wall of Fame</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">Achievements</h1>
          <p className="text-muted-foreground text-sm mt-1">Celebrating accomplishments from across ITG.</p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto text-sm px-3 py-1">{achievements.length} achievements</Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <Card key={achievement.id} className="card-hover flex flex-col overflow-hidden border-0 shadow-md">
              <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
              <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm"><Award className="h-5 w-5" /></div>
                  <Badge variant="secondary" className="text-xs mt-1 shrink-0">{formatDistanceToNow(new Date(achievement.date), { addSuffix: true })}</Badge>
                </div>
                <h3 className="text-base font-bold mt-3 leading-snug">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{achievement.description}</p>
              </CardHeader>
              <CardContent className="flex-grow px-4 sm:px-5" />
              <CardFooter className="px-4 sm:px-5 pb-4 border-t border-border/50 pt-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-2 ring-amber-100 shadow-sm">
                    <AvatarImage src={achievement.employeePhotoUrl} data-ai-hint={achievement.employeePhotoHint} />
                    <AvatarFallback className="text-xs font-bold bg-amber-50 text-amber-700">{achievement.employeeName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold leading-none">{achievement.employeeName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">ITG Employee</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
          {!loading && achievements.length === 0 && (
            <div className="col-span-full rounded-xl border-2 border-dashed border-border p-12 text-center">
              <Trophy className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No achievements yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
