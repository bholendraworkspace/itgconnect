import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/lib/data";
import { format } from "date-fns";
import { Award, Edit, Mail, Building } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ProfilePage() {
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-accent" />
        <CardContent className="p-6">
          <div className="flex items-end -mt-20">
            <Avatar className="h-32 w-32 border-4 border-card">
              <AvatarImage src={currentUser.profilePhotoUrl} data-ai-hint={currentUser.profilePhotoHint} />
              <AvatarFallback className="text-4xl">{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 mb-2">
              <h1 className="text-3xl font-bold">{currentUser.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                 <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{currentUser.email}</span>
                 </div>
                 {currentUser.department && (
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{currentUser.department}</span>
                    </div>
                 )}
              </div>
            </div>
            <Button asChild variant="outline" className="ml-auto">
              <Link href="/profile/edit">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            My Achievements
          </CardTitle>
          <CardDescription>A collection of your accomplishments at ITG.</CardDescription>
        </CardHeader>
        <CardContent>
          {currentUser.achievements.length > 0 ? (
            <div className="space-y-4">
              {currentUser.achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge variant="secondary">{format(new Date(achievement.date), "MMM yyyy")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No achievements recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
