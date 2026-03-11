import { useState } from "react";
import { type Idea } from "@/lib/types";
import { format } from "date-fns";
import { Lightbulb, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function IdeasCorner({ initialIdeas }: { initialIdeas: Idea[] }) {
    const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);

    const handleVote = (id: string) => {
        setIdeas(prevIdeas => 
            prevIdeas.map(idea => 
                idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
            )
        );
    };

    return (
        <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-2xl font-semibold tracking-tight">Ideas Corner</CardTitle>
                <Lightbulb className="h-6 w-6 text-yellow-400" />
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
                    {ideas.map((idea) => (
                        <Card key={idea.id} className="flex flex-col h-full">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={idea.employeePhotoUrl} />
                                            <AvatarFallback>{idea.employeeName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{idea.employeeName}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(idea.date), 'MMM d, yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-bold">{idea.votes}</span>
                                    </div>
                                </div>
                                <CardTitle className="mt-4 text-lg">{idea.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{idea.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full" onClick={() => handleVote(idea.id)}>
                                    <ThumbsUp className="mr-2 h-4 w-4" /> Vote
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
