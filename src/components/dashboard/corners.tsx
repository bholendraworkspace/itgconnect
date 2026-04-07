"use client";
import { type Employee, type SpecialAnnouncement } from "@/lib/types";
import { parse, isToday, isFuture, isPast, differenceInDays, format, isSameDay } from "date-fns";
import { Cake, Gift, Home, Baby, Car, Briefcase, Heart, PartyPopper, Plus, Pencil, Trash2, CalendarDays, UserPlus, ChevronUp, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEmployees, useAnnouncements } from "@/hooks/use-firestore-data";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";

// ─── Avatar colors ────────────────────────────────────────────────────────────
const avatarColors = [
  "bg-emerald-500", "bg-orange-500", "bg-sky-500", "bg-rose-500",
  "bg-violet-500", "bg-amber-500", "bg-teal-500", "bg-pink-500",
  "bg-cyan-500", "bg-lime-500", "bg-indigo-500", "bg-fuchsia-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Birthday / Anniversary Avatar Card ───────────────────────────────────────
function PersonCircle({ employee, label, onWish }: { employee: Employee; label: string; onWish?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24">
      <div className="relative">
        <Avatar className={cn("h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-white shadow-md", !employee.profilePhotoUrl && getAvatarColor(employee.name))}>
          <AvatarImage src={employee.profilePhotoUrl} />
          <AvatarFallback className="text-sm sm:text-base font-bold text-white bg-transparent">
            {getInitials(employee.name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <p className="text-xs font-semibold leading-tight text-center truncate w-full">{employee.name.split(" ")[0]}{employee.name.split(" ").length > 1 ? ".." : ""}</p>
      {onWish ? (
        <button onClick={onWish} className="text-[11px] font-medium text-primary hover:underline">Wish</button>
      ) : (
        <span className="text-[11px] text-muted-foreground">{label}</span>
      )}
    </div>
  );
}

function OverflowCircle({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-20 sm:w-24">
      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
        <span className="text-sm font-semibold text-muted-foreground">+{count}</span>
      </div>
      <p className="text-xs text-muted-foreground">more</p>
    </div>
  );
}

// ─── Birthday Corner (Redesigned) ─────────────────────────────────────────────

type TabId = "birthdays" | "anniversaries" | "joinees";

export function BirthdayCorner() {
  const { toast } = useToast();
  const { employees } = useEmployees();
  const [activeTab, setActiveTab] = useState<TabId>("birthdays");
  const [expanded, setExpanded] = useState(false);
  const today = new Date();

  // ─ Birthdays ─
  const thisYearBirthday = (dateStr: string) => {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return new Date(today.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const birthdaysToday = employees.filter((e) => e.birthDate && isToday(thisYearBirthday(e.birthDate)));
  const upcomingBirthdays = employees
    .filter((e) => { if (!e.birthDate) return false; const b = thisYearBirthday(e.birthDate); return isFuture(b) && differenceInDays(b, today) <= 30; })
    .sort((a, b) => differenceInDays(thisYearBirthday(a.birthDate), thisYearBirthday(b.birthDate)));

  // ─ Work Anniversaries ─
  const thisYearAnniversary = (dateStr: string) => {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return new Date(today.getFullYear(), parsed.getMonth(), parsed.getDate());
  };

  const anniversariesToday = employees.filter((e) => e.workAnniversary && isToday(thisYearAnniversary(e.workAnniversary)));
  const upcomingAnniversaries = employees
    .filter((e) => { if (!e.workAnniversary) return false; const a = thisYearAnniversary(e.workAnniversary); return isFuture(a) && differenceInDays(a, today) <= 30; })
    .sort((a, b) => differenceInDays(thisYearAnniversary(a.workAnniversary!), thisYearAnniversary(b.workAnniversary!)));

  // ─ New Joinees (joined within last 30 days) ─
  const newJoinees = employees.filter((e) => {
    if (!e.workAnniversary) return false;
    const joinDate = parse(e.workAnniversary, "yyyy-MM-dd", new Date());
    return differenceInDays(today, joinDate) >= 0 && differenceInDays(today, joinDate) <= 30 && joinDate.getFullYear() === today.getFullYear();
  });

  const birthdayCount = birthdaysToday.length;
  const anniversaryCount = anniversariesToday.length + upcomingAnniversaries.filter((e) => {
    const a = thisYearAnniversary(e.workAnniversary!);
    return differenceInDays(a, today) <= 7;
  }).length;
  const joineeCount = newJoinees.length;

  const tabs: { id: TabId; icon: React.ReactNode; label: string; count: number; color: string }[] = [
    { id: "birthdays", icon: <Cake className="h-4 w-4" />, label: "Birthdays", count: birthdayCount + upcomingBirthdays.length, color: "text-primary" },
    { id: "anniversaries", icon: <PartyPopper className="h-4 w-4" />, label: "Work Anniversaries", count: anniversariesToday.length + upcomingAnniversaries.length, color: "text-emerald-500" },
    { id: "joinees", icon: <UserPlus className="h-4 w-4" />, label: "New Joinees", count: joineeCount, color: "text-blue-500" },
  ];

  const formatBirthdayLabel = (dateStr: string) => {
    const b = thisYearBirthday(dateStr);
    if (isToday(b)) return "Today";
    const diff = differenceInDays(b, today);
    if (diff === 1) return "Tomorrow";
    return format(b, "dd MMMM");
  };

  const formatAnniversaryLabel = (dateStr: string) => {
    const a = thisYearAnniversary(dateStr);
    if (isToday(a)) return "Today";
    const diff = differenceInDays(a, today);
    if (diff === 1) return "Tomorrow";
    return format(a, "dd MMMM");
  };

  const wish = (name: string, type: string) => {
    toast({ title: `${type === "birthday" ? "🎉" : "🎊"} Wish Sent!`, description: `Your ${type} wish has been sent to ${name}.` });
  };

  const VISIBLE_LIMIT = 11;

  // ─ Render content based on active tab ─
  const renderContent = () => {
    if (activeTab === "birthdays") {
      const allBirthdays = [...birthdaysToday, ...upcomingBirthdays];
      if (allBirthdays.length === 0) return <EmptyState icon={<Cake className="h-7 w-7" />} text="No birthdays coming up." />;

      const sections: { title: string; people: { emp: Employee; label: string; isToday: boolean }[] }[] = [];
      if (birthdaysToday.length > 0) {
        sections.push({ title: "Birthdays today", people: birthdaysToday.map((e) => ({ emp: e, label: "Today", isToday: true })) });
      }
      if (upcomingBirthdays.length > 0) {
        sections.push({ title: "Upcoming Birthdays", people: upcomingBirthdays.map((e) => ({ emp: e, label: formatBirthdayLabel(e.birthDate), isToday: false })) });
      }

      return (
        <div className="space-y-5">
          {sections.map((section) => {
            const visible = expanded ? section.people : section.people.slice(0, VISIBLE_LIMIT);
            const overflow = section.people.length - VISIBLE_LIMIT;
            return (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {visible.map(({ emp, label, isToday: isTodayBday }) => (
                    <PersonCircle
                      key={emp.id}
                      employee={emp}
                      label={label}
                      onWish={isTodayBday ? () => wish(emp.name, "birthday") : undefined}
                    />
                  ))}
                  {!expanded && overflow > 0 && <OverflowCircle count={overflow} />}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === "anniversaries") {
      const allAnniversaries = [...anniversariesToday, ...upcomingAnniversaries];
      if (allAnniversaries.length === 0) return <EmptyState icon={<PartyPopper className="h-7 w-7" />} text="No work anniversaries coming up." />;

      const sections: { title: string; people: { emp: Employee; label: string; isToday: boolean }[] }[] = [];
      if (anniversariesToday.length > 0) {
        sections.push({ title: "Anniversaries today", people: anniversariesToday.map((e) => ({ emp: e, label: "Today", isToday: true })) });
      }
      if (upcomingAnniversaries.length > 0) {
        sections.push({ title: "Upcoming Anniversaries", people: upcomingAnniversaries.map((e) => ({ emp: e, label: formatAnniversaryLabel(e.workAnniversary!), isToday: false })) });
      }

      return (
        <div className="space-y-5">
          {sections.map((section) => {
            const visible = expanded ? section.people : section.people.slice(0, VISIBLE_LIMIT);
            const overflow = section.people.length - VISIBLE_LIMIT;
            return (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {visible.map(({ emp, label, isToday: isTodayAnn }) => (
                    <PersonCircle
                      key={emp.id}
                      employee={emp}
                      label={label}
                      onWish={isTodayAnn ? () => wish(emp.name, "anniversary") : undefined}
                    />
                  ))}
                  {!expanded && overflow > 0 && <OverflowCircle count={overflow} />}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // New Joinees
    if (newJoinees.length === 0) return <EmptyState icon={<UserPlus className="h-7 w-7" />} text="No new joinees this month." />;
    const visible = expanded ? newJoinees : newJoinees.slice(0, VISIBLE_LIMIT);
    const overflow = newJoinees.length - VISIBLE_LIMIT;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Recently Joined</h3>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {visible.map((emp) => (
            <PersonCircle key={emp.id} employee={emp} label={format(parse(emp.workAnniversary!, "yyyy-MM-dd", new Date()), "dd MMM")} />
          ))}
          {!expanded && overflow > 0 && <OverflowCircle count={overflow} />}
        </div>
      </div>
    );
  };

  const currentTabPeople = activeTab === "birthdays"
    ? birthdaysToday.length + upcomingBirthdays.length
    : activeTab === "anniversaries"
      ? anniversariesToday.length + upcomingAnniversaries.length
      : newJoinees.length;

  return (
    <Card className="card-hover overflow-hidden border-0 shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500" />

      {/* Tabs */}
      <div className="flex items-center border-b border-border/50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setExpanded(false); }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all -mb-px flex-1 justify-center",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
              )}
            >
              <span className={cn(isActive ? tab.color : "text-muted-foreground")}>{tab.icon}</span>
              <span className="font-bold text-sm">{tab.count}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}

        {/* Collapse/Expand */}
        {currentTabPeople > VISIBLE_LIMIT && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Content */}
      <CardContent className="px-4 sm:px-5 py-4 sm:py-5">
        {renderContent()}
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
      <div className="mx-auto text-muted-foreground/30 mb-2">{icon}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
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
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { employees } = useEmployees();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    toast({ title: "Announcement Posted!", description: "Your announcement has been shared." });
  };

  const openEdit = (ann: SpecialAnnouncement) => {
    setForm({ type: ann.type });
    setEditId(ann.id);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await updateAnnouncement(editId, { type: form.type });
    setEditId(null);
    setForm({ type: "car" });
    toast({ title: "Announcement Updated", description: "Your changes have been saved." });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteAnnouncement(deleteId);
    setDeleteId(null);
    toast({ title: "Announcement Deleted", description: "The announcement has been removed." });
  };

  return (
    <Card className="card-hover overflow-hidden border-0 shadow-md flex-1">
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-primary" />
      <div className="pb-3 pt-4 px-4 sm:px-5 flex flex-row items-center justify-between">
        <h3 className="text-sm font-semibold">Special Announcements</h3>
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
      </div>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        {announcements.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {(showAll ? announcements : announcements.slice(0, 2)).map((announcement) => {
              const config = announcementConfig[announcement.type];
              const isOwner = announcement.employeeId === currentEmployee?.id;
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
                  <div className="flex items-center gap-1 shrink-0">
                    {isOwner && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(announcement)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => setDeleteId(announcement.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 sm:h-8 rounded-lg text-base"
                      onClick={() => toast({ title: "Congratulations Sent!", description: `You congratulated ${announcement.employeeName}!` })}>
                      🎉
                    </Button>
                  </div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => { if (!open) { setEditId(null); setForm({ type: "car" }); } }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle className="gradient-text">Edit Announcement</DialogTitle></DialogHeader>
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
            <Button variant="ghost" onClick={() => setEditId(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleUpdate} className="rounded-xl bg-gradient-to-r from-violet-500 to-primary text-white hover:opacity-90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Announcement?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
