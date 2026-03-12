"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Lightbulb, ThumbsUp, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIdeas, useEmployees } from "@/hooks/use-firestore-data";
import { useUser } from "@/firebase";

export function IdeasCorner() {
  const { toast } = useToast();
  const { ideas, vote, addIdea } = useIdeas();
  const { employees } = useEmployees();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const uid = user?.uid || "anonymous";
  const currentEmployee = employees.find((e) => e.email === user?.email) || employees.find((e) => e.id === "4");
  const maxVotes = Math.max(...ideas.map((i) => i.votes), 1);

  const handleVote = async (ideaId: string) => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return;
    const hasVoted = idea.votedBy?.includes(uid);
    await vote(ideaId, uid, !!hasVoted);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !currentEmployee) return;
    await addIdea({
      title: form.title.trim(),
      description: form.description.trim(),
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeePhotoUrl: currentEmployee.profilePhotoUrl,
      date: new Date().toISOString(),
    });
    setOpen(false);
    setForm({ title: "", description: "" });
    toast({ title: "💡 Idea Submitted!", description: "Your idea has been posted." });
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-amber-500" />
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 sm:px-5">
        <CardTitle className="section-title text-lg sm:text-xl">Ideas Corner</CardTitle>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:opacity-90 h-8">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm rounded-2xl">
              <DialogHeader><DialogTitle className="gradient-text">Submit an Idea</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Title <span className="text-primary">*</span></Label>
                  <Input className="rounded-xl" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Your great idea…" />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea className="rounded-xl resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell us more…" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={!form.title.trim()} className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:opacity-90">Submit Idea</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-sm">
            <Lightbulb className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => {
            const hasVoted = idea.votedBy?.includes(uid);
            const votePercent = Math.round((idea.votes / maxVotes) * 100);
            return (
              <Card key={idea.id} className={`flex flex-col border transition-all duration-300 ${hasVoted ? "border-primary/30 shadow-md shadow-primary/10" : "border-border hover:border-primary/20 hover:shadow-sm"}`}>
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={idea.employeePhotoUrl} />
                        <AvatarFallback className="text-xs font-bold">{idea.employeeName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold leading-none truncate">{idea.employeeName}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(idea.date), "MMM d")}</p>
                      </div>
                    </div>
                    <Badge variant={hasVoted ? "default" : "secondary"} className={`shrink-0 gap-1 text-xs ${hasVoted ? "bg-primary/10 text-primary border-primary/20" : ""}`}>
                      <ThumbsUp className="h-3 w-3" />{idea.votes}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold leading-snug">{idea.title}</h3>
                </CardHeader>
                <CardContent className="flex-grow px-4 pb-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{idea.description}</p>
                  <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500" style={{ width: `${votePercent}%` }} />
                  </div>
                </CardContent>
                <CardFooter className="px-4 pb-4">
                  <Button size="sm" variant={hasVoted ? "default" : "outline"}
                    className={`w-full rounded-xl text-xs font-semibold transition-all duration-200 ${hasVoted ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 shadow-sm" : "hover:border-primary/30 hover:text-primary"}`}
                    onClick={() => handleVote(idea.id)}>
                    <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                    {hasVoted ? "Voted!" : "Vote"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {ideas.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No ideas yet. Submit the first one!</p>}
        </div>
      </CardContent>
    </Card>
  );
}
