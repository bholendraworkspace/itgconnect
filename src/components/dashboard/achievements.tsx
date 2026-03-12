"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Achievement, type Recognition } from "@/lib/types";
import { format } from "date-fns";
import { Award, Star, Quote, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAchievements, useRecognitions, useEmployees } from "@/hooks/use-firestore-data";
import { useUser } from "@/firebase";

export function AchievementsCorner() {
  const { achievements } = useAchievements();

  return (
    <Card className="card-hover overflow-hidden border-0 shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 sm:px-5">
        <CardTitle className="section-title text-lg sm:text-xl">Achievements</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm">
          <Award className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="space-y-3">
          {achievements.slice(0, 5).map((achievement) => (
            <div key={achievement.id} className="flex gap-3 rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/60">
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-amber-100 shadow-sm">
                <AvatarImage src={achievement.employeePhotoUrl} data-ai-hint={achievement.employeePhotoHint} />
                <AvatarFallback className="text-xs font-bold bg-amber-50 text-amber-700">{achievement.employeeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold leading-tight">{achievement.title}</p>
                  <Badge variant="outline" className="text-xs shrink-0 border-amber-200 text-amber-700 bg-amber-50">{format(new Date(achievement.date), "MMM d")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{achievement.employeeName}</p>
                <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">{achievement.description}</p>
              </div>
            </div>
          ))}
          {achievements.length === 0 && <p className="text-sm text-muted-foreground">No achievements yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecognitionCorner() {
  const { toast } = useToast();
  const { recognitions, addRecognition } = useRecognitions();
  const { employees } = useEmployees();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [toId, setToId] = useState("");
  const [message, setMessage] = useState("");

  const currentEmployee = employees.find((e) => e.email === user?.email) || employees.find((e) => e.id === "4");

  const handleSubmit = async () => {
    const toEmployee = employees.find((e) => e.id === toId);
    if (!toEmployee || !currentEmployee || !message.trim()) return;
    await addRecognition({
      fromEmployeeId: currentEmployee.id,
      fromEmployeeName: currentEmployee.name,
      toEmployeeId: toEmployee.id,
      toEmployeeName: toEmployee.name,
      toEmployeePhotoUrl: toEmployee.profilePhotoUrl,
      message: message.trim(),
      date: new Date().toISOString(),
    });
    setOpen(false);
    setMessage("");
    setToId("");
    toast({ title: "⭐ Recognition Sent!", description: `You recognized ${toEmployee.name}.` });
  };

  return (
    <Card className="card-hover overflow-hidden border-0 shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-primary to-violet-500" />
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 sm:px-5">
        <CardTitle className="section-title text-lg sm:text-xl">Recognition</CardTitle>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90 h-8">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm rounded-2xl">
              <DialogHeader><DialogTitle className="gradient-text">Give Recognition</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Recognize</Label>
                  <Select value={toId} onValueChange={setToId}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select colleague…" /></SelectTrigger>
                    <SelectContent>
                      {employees.filter((e) => e.id !== currentEmployee?.id).map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <Textarea className="rounded-xl resize-none" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them why they're awesome…" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={!toId || !message.trim()} className="rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white hover:opacity-90">Send Recognition</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-white shadow-sm">
            <Star className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="space-y-3">
          {recognitions.slice(0, 5).map((recognition) => (
            <div key={recognition.id} className="rounded-xl bg-muted/40 p-3 transition-colors hover:bg-muted/60">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white shadow-sm">
                  <AvatarImage src={recognition.toEmployeePhotoUrl} />
                  <AvatarFallback className="text-xs font-bold">{recognition.toEmployeeName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium leading-snug">
                    <span className="font-bold text-primary">{recognition.fromEmployeeName}</span>
                    <span className="text-muted-foreground"> recognized </span>
                    <span className="font-bold">{recognition.toEmployeeName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{format(new Date(recognition.date), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="mt-2.5 flex gap-2 pl-1">
                <Quote className="h-3.5 w-3.5 shrink-0 text-primary/40 mt-0.5" />
                <p className="text-xs text-foreground/70 italic leading-relaxed">{recognition.message}</p>
              </div>
            </div>
          ))}
          {recognitions.length === 0 && <p className="text-sm text-muted-foreground">No recognitions yet. Be the first!</p>}
        </div>
      </CardContent>
    </Card>
  );
}
