"use client";
import { type Employee, type SpecialAnnouncement } from "@/lib/types";
import { parse, isToday, isFuture, isPast, differenceInDays, format } from "date-fns";
import { Cake, Gift, Home, Baby, Car, Briefcase, Heart, PartyPopper, Plus } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEmployees, useAnnouncements } from "@/hooks/use-firestore-data";
import { useUser } from "@/firebase";

// ─── Birthday Corner ──────────────────────────────────────────────────────────

type BirthdayCardProps = {
  title: string;
  employees: Employee[];
  variant: "today" | "upcoming" | "past";
  wide?: boolean;
};

const variantConfig = {
  today:    { icon: <PartyPopper className="h-4 w-4" />, gradient: "from-primary to-rose-400" },
  upcoming: { icon: <Cake className="h-4 w-4" />,        gradient: "from-accent to-yellow-400" },
  past:     { icon: <Gift className="h-4 w-4" />,        gradient: "from-violet-500 to-indigo-400" },
};

export const BirthdayCard = ({ title, employees, variant, wide }: BirthdayCardProps) => {
  const { toast } = useToast();
  const config = variantConfig[variant];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${config.gradient}`} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {employees.map((employee) => (
          <div key={employee.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 shrink-0 ring-2 ring-white shadow-sm">
                <AvatarImage src={employee.profilePhotoUrl} data-ai-hint={employee.profilePhotoHint} />
                <AvatarFallback className="text-xs font-bold">{employee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-none truncate">{employee.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(parse(employee.birthDate, "yyyy-MM-dd", new Date()), "MMMM do")}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost"
              className="h-7 shrink-0 rounded-lg text-xs font-medium hover:bg-primary/10 hover:text-primary"
              onClick={() => toast({ title: "🎉 Wish Sent!", description: `Your birthday wish has been sent to ${employee.name}.` })}
            >
              <Gift className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">Wish</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export function BirthdayCorner() {
  const { employees } = useEmployees();
  const today = new Date();

  // Normalize a stored birthDate to the current year so comparisons work year-round
  const thisYearBirthday = (dateStr: string) => {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return new Date(today.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const birthdaysToday    = employees.filter((e) => isToday(thisYearBirthday(e.birthDate)));
  const upcomingBirthdays = employees.filter((e) => { const b = thisYearBirthday(e.birthDate); return isFuture(b) && differenceInDays(b, today) <= 7; }).sort((a, b) => differenceInDays(thisYearBirthday(a.birthDate), thisYearBirthday(b.birthDate)));
  const pastBirthdays     = employees.filter((e) => { const b = thisYearBirthday(e.birthDate); return isPast(b) && !isToday(b) && differenceInDays(today, b) <= 7; }).sort((a, b) => differenceInDays(thisYearBirthday(b.birthDate), thisYearBirthday(a.birthDate)));
  const hasAny = birthdaysToday.length > 0 || upcomingBirthdays.length > 0 || pastBirthdays.length > 0;

  return (
    <Card className="card-hover overflow-hidden border-0 shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-400" />
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 sm:px-5">
        <CardTitle className="text-sm font-semibold">Birthdays</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]"><Cake className="mr-1 h-3 w-3" />This week</Badge>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-sm">
            <Cake className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
        {birthdaysToday.length > 0    && <BirthdayCard title="Today"    employees={birthdaysToday.slice(0, 5)}    variant="today"    wide />}
        {upcomingBirthdays.length > 0 && <BirthdayCard title="Upcoming" employees={upcomingBirthdays.slice(0, 5)} variant="upcoming" wide />}
        {pastBirthdays.length > 0     && <BirthdayCard title="Recent"   employees={pastBirthdays.slice(0, 5)}    variant="past"     wide />}
        {!hasAny && (
          <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
            <Cake className="mx-auto h-7 w-7 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No birthdays this week.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Special Announcements ────────────────────────────────────────────────────

const announcementConfig: Record<SpecialAnnouncement["type"], { icon: React.ReactNode; gradient: string; label: string }> = {
  car:              { icon: <Car      className="h-4 w-4 text-white" />, gradient: "from-blue-500 to-cyan-400",     label: "New Ride" },
  home:             { icon: <Home     className="h-4 w-4 text-white" />, gradient: "from-emerald-500 to-teal-400",  label: "New Home" },
  kid:              { icon: <Baby     className="h-4 w-4 text-white" />, gradient: "from-pink-500 to-rose-400",     label: "New Baby" },
  marriage:         { icon: <Heart    className="h-4 w-4 text-white" />, gradient: "from-purple-500 to-violet-400", label: "Marriage" },
  work_anniversary: { icon: <Briefcase className="h-4 w-4 text-white" />, gradient: "from-amber-500 to-yellow-400", label: "Anniversary" },
};

export function SpecialAnnouncementsCorner() {
  const { toast } = useToast();
  const { announcements, addAnnouncement } = useAnnouncements();
  const { employees } = useEmployees();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ type: "car" as SpecialAnnouncement["type"] });

  const currentEmployee = employees.find((e) => e.email === user?.email) || employees[0];

  const handlePost = async () => {
    if (!currentEmployee) return;
    await addAnnouncement({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeePhotoUrl: currentEmployee.profilePhotoUrl,
      type: form.type,
      date: new Date().toISOString(),
    });
    setOpen(false);
    toast({ title: "🎊 Announcement Posted!", description: "Your announcement has been shared." });
  };

  return (
    <Card className="card-hover overflow-hidden border-0 shadow-md flex-1">
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-primary" />
      <CardHeader className="pb-3 pt-4 px-4 sm:px-5 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Special Announcements</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-violet-500 to-primary text-white hover:opacity-90 h-8">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm rounded-2xl">
            <DialogHeader><DialogTitle className="gradient-text">Post Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Announcement Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ type: v as SpecialAnnouncement["type"] })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(announcementConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handlePost} className="rounded-xl bg-gradient-to-r from-violet-500 to-primary text-white hover:opacity-90">Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        {announcements.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {(showAll ? announcements : announcements.slice(0, 2)).map((announcement) => {
              const config = announcementConfig[announcement.type];
              return (
                <div key={announcement.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-white shadow-sm">
                        <AvatarImage src={announcement.employeePhotoUrl} />
                        <AvatarFallback className="text-xs font-bold">{announcement.employeeName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${config.gradient} shadow-sm`}>
                        <div className="scale-[0.6]">{config.icon}</div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold leading-none truncate">{announcement.employeeName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{config.label} • {format(new Date(announcement.date), "MMM d")}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 sm:h-8 shrink-0 rounded-lg text-base"
                    onClick={() => toast({ title: "🎊 Congratulations Sent!", description: `You congratulated ${announcement.employeeName}!` })}>
                    🎉
                  </Button>
                </div>
              );
            })}
            {announcements.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : `View All (${announcements.length})`}
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No special announcements at this time.</p>
        )}
      </CardContent>
    </Card>
  );
}
