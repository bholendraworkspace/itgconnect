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
};

const variantConfig = {
  today:    { icon: <PartyPopper className="h-4 w-4" />, gradient: "from-primary to-rose-400" },
  upcoming: { icon: <Cake className="h-4 w-4" />,        gradient: "from-accent to-yellow-400" },
  past:     { icon: <Gift className="h-4 w-4" />,        gradient: "from-violet-500 to-indigo-400" },
};

export const BirthdayCard = ({ title, employees, variant }: BirthdayCardProps) => {
  const { toast } = useToast();
  const config = variantConfig[variant];

  return (
    <Card className="card-hover overflow-hidden border-0 shadow-md">
      <div className={`h-1 w-full bg-gradient-to-r ${config.gradient}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 sm:px-5">
        <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
          {config.icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        {employees.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 sm:py-2.5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 ring-2 ring-white shadow-sm">
                    <AvatarImage src={employee.profilePhotoUrl} data-ai-hint={employee.profilePhotoHint} />
                    <AvatarFallback className="text-xs font-bold">{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold leading-none truncate">{employee.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parse(employee.birthDate, "yyyy-MM-dd", new Date()), "MMMM do")}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost"
                  className="h-7 sm:h-8 shrink-0 rounded-lg text-xs font-medium hover:bg-primary/10 hover:text-primary"
                  onClick={() => toast({ title: "🎉 Wish Sent!", description: `Your birthday wish has been sent to ${employee.name}.` })}
                >
                  <Gift className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Wish</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No {title.toLowerCase()} this week.</p>
        )}
      </CardContent>
    </Card>
  );
};

export function BirthdayCorner() {
  const { employees } = useEmployees();
  const today = new Date();
  const parseDate = (dateStr: string) => parse(dateStr, "yyyy-MM-dd", new Date());

  const birthdaysToday    = employees.filter((e) => isToday(parseDate(e.birthDate)));
  const upcomingBirthdays = employees.filter((e) => { const b = parseDate(e.birthDate); return isFuture(b) && differenceInDays(b, today) <= 7; }).sort((a,b) => differenceInDays(parseDate(a.birthDate), parseDate(b.birthDate)));
  const pastBirthdays     = employees.filter((e) => { const b = parseDate(e.birthDate); return isPast(b) && !isToday(b) && differenceInDays(today, b) <= 7; }).sort((a,b) => differenceInDays(parseDate(b.birthDate), parseDate(a.birthDate)));
  const hasAny = birthdaysToday.length > 0 || upcomingBirthdays.length > 0 || pastBirthdays.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="section-title">Birthday Corner</h2>
        <Badge variant="outline" className="text-xs"><Cake className="mr-1 h-3 w-3" /> This week</Badge>
      </div>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {birthdaysToday.length > 0    && <BirthdayCard title="Today's Birthdays"    employees={birthdaysToday}    variant="today" />}
        {upcomingBirthdays.length > 0 && <BirthdayCard title="Upcoming Birthdays"   employees={upcomingBirthdays} variant="upcoming" />}
        {pastBirthdays.length > 0     && <BirthdayCard title="Past Birthdays"       employees={pastBirthdays}     variant="past" />}
        {!hasAny && (
          <div className="col-span-full rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Cake className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No birthdays this week.</p>
          </div>
        )}
      </div>
    </div>
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
    <Card className="card-hover overflow-hidden border-0 shadow-md h-full">
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-primary" />
      <CardHeader className="pb-3 pt-4 px-4 sm:px-5 flex flex-row items-center justify-between">
        <CardTitle className="section-title text-lg sm:text-xl">Special Announcements</CardTitle>
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
            {announcements.map((announcement) => {
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
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No special announcements at this time.</p>
        )}
      </CardContent>
    </Card>
  );
}
