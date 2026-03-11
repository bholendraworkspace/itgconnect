import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { type Achievement, type Recognition } from "@/lib/types";
import { format } from "date-fns";
import { Award, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AchievementsCorner({ achievements }: { achievements: Achievement[] }) {
    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-2xl font-semibold tracking-tight">Achievements Corner</CardTitle>
                <Award className="h-6 w-6 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="space-y-6 mt-4">
                    {achievements.map((achievement) => (
                        <div key={achievement.id} className="flex gap-4 items-start border-b pb-4 last:border-0 last:pb-0">
                            <Avatar className="h-10 w-10 mt-1">
                                <AvatarImage src={achievement.employeePhotoUrl} data-ai-hint={achievement.employeePhotoHint} />
                                <AvatarFallback>{achievement.employeeName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{achievement.title}</p>
                                <p className="text-sm text-muted-foreground">{achievement.employeeName} • {format(new Date(achievement.date), 'MMM d, yyyy')}</p>
                                <p className="text-sm mt-2">{achievement.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function RecognitionCorner({ recognitions }: { recognitions: Recognition[] }) {
    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-2xl font-semibold tracking-tight">Recognition Corner</CardTitle>
                <Star className="h-6 w-6 text-orange-500" />
            </CardHeader>
            <CardContent>
                <div className="space-y-6 mt-4">
                    {recognitions.map((recognition) => (
                        <div key={recognition.id} className="flex gap-4 items-start border-b pb-4 last:border-0 last:pb-0">
                            <Avatar className="h-10 w-10 mt-1">
                                <AvatarImage src={recognition.toEmployeePhotoUrl} />
                                <AvatarFallback>{recognition.toEmployeeName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    <span className="font-bold">{recognition.fromEmployeeName}</span> recognized <span className="font-bold">{recognition.toEmployeeName}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">{format(new Date(recognition.date), 'MMM d, yyyy')}</p>
                                <p className="text-sm italic mt-2">"{recognition.message}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
