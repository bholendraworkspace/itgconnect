import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { achievements } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { Award } from "lucide-react";

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">
          See the latest accomplishments from across the company.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{achievement.title}</CardTitle>
                <div className="p-2 rounded-md bg-accent/10 text-accent">
                   <Award className="h-5 w-5" />
                </div>
              </div>
              <CardDescription>{achievement.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardFooter>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={achievement.employeePhotoUrl} data-ai-hint={achievement.employeePhotoHint} />
                  <AvatarFallback>{achievement.employeeName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-semibold">{achievement.employeeName}</p>
                  <p className="text-muted-foreground">{formatDistanceToNow(new Date(achievement.date), { addSuffix: true })}</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
