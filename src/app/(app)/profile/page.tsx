"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Award, Edit, Mail, Building, Star, CalendarDays, Loader2, UserRound, Save } from "lucide-react";
import React, { useState } from "react";
import { useUser } from "@/firebase";
import { useEmployees, useAchievements, useRecognitions } from "@/hooks/use-firestore-data";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useUser();
  const { employees, loading: empLoading, updateEmployee } = useEmployees();
  const { achievements, loading: achLoading } = useAchievements();
  const { recognitions, loading: recLoading } = useRecognitions();
  const { toast } = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", department: "" });

  const isLoading = empLoading || achLoading || recLoading;

  // Find logged-in user's employee record
  const currentEmployee = user?.isAnonymous
    ? employees[0]
    : employees.find((e) => e.email === user?.email);

  const myAchievements = achievements.filter((a) => a.employeeId === currentEmployee?.id);
  const myRecognitions = recognitions.filter((r) => r.toEmployeeId === currentEmployee?.id);

  const openSheet = () => {
    setForm({
      name: currentEmployee?.name || "",
      department: currentEmployee?.department || "",
    });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!currentEmployee) return;
    setSaving(true);
    try {
      await updateEmployee(currentEmployee.id, {
        name: form.name,
        department: form.department,
      });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      setSheetOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <UserRound className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Profile not found.</p>
        </div>
      </div>
    );
  }

  const joinYear = currentEmployee.workAnniversary
    ? format(new Date(currentEmployee.workAnniversary), "yyyy")
    : "2022";

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl mx-auto">
      {/* Profile hero card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Banner */}
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-primary via-rose-500 to-accent">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-8 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        </div>

        <CardContent className="px-4 sm:px-6 pb-6">
          {/* Avatar + Edit row */}
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-xl ring-2 ring-primary/20">
              <AvatarImage src={currentEmployee.profilePhotoUrl} />
              <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                {currentEmployee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button onClick={openSheet} variant="outline" size="sm" className="mb-1 rounded-xl gap-2">
                  <Edit className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
                {/* Drawer header with gradient */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md">
                      <Edit className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <SheetTitle className="text-xl font-bold">Edit Profile</SheetTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Update your personal info</p>
                    </div>
                  </div>
                </SheetHeader>

                {/* Drawer body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Avatar preview */}
                  <div className="flex items-center gap-4 rounded-2xl bg-muted/40 p-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
                      <AvatarImage src={currentEmployee.profilePhotoUrl} />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                        {form.name.charAt(0) || currentEmployee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{form.name || currentEmployee.name}</p>
                      <p className="text-xs text-muted-foreground">{currentEmployee.email}</p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name"
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                      <Input
                        id="department"
                        value={form.department}
                        onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                        placeholder="e.g. Engineering, Marketing…"
                        className="rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <Input
                        value={currentEmployee.email}
                        disabled
                        className="rounded-xl h-11 opacity-60 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">Email is managed by your sign-in provider.</p>
                    </div>
                  </div>
                </div>

                {/* Drawer footer */}
                <div className="border-t border-border/60 px-6 py-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !form.name.trim()}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 shadow-md shadow-primary/30"
                  >
                    {saving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Name + meta */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentEmployee.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>{currentEmployee.email}</span>
              </div>
              {currentEmployee.department && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  <span>{currentEmployee.department}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: "Achievements", value: myAchievements.length, icon: <Award className="h-4 w-4 text-amber-500" /> },
              { label: "Recognitions", value: myRecognitions.length, icon: <Star className="h-4 w-4 text-primary" /> },
              { label: "Member Since", value: joinYear, icon: <CalendarDays className="h-4 w-4 text-blue-500" /> },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center rounded-xl bg-muted/40 px-3 py-3 text-center">
                <div className="mb-1">{stat.icon}</div>
                <p className="text-lg font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
        <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">My Achievements</CardTitle>
              <CardDescription className="text-xs">Your accomplishments at ITG</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-5">
          {myAchievements.length > 0 ? (
            <div className="space-y-3">
              {myAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold leading-snug">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs border-amber-200 text-amber-700 bg-amber-50">
                    {format(new Date(achievement.date), "MMM yyyy")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <Award className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No achievements recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recognitions received */}
      {myRecognitions.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-violet-400" />
          <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-400 text-white shadow-sm">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Recognitions Received</CardTitle>
                <CardDescription className="text-xs">Shoutouts from your teammates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-5">
            <div className="space-y-3">
              {myRecognitions.map((rec) => (
                <div key={rec.id} className="rounded-xl bg-muted/40 px-4 py-3">
                  <p className="text-sm text-foreground leading-relaxed">"{rec.message}"</p>
                  <p className="text-xs text-muted-foreground mt-1.5">— {rec.fromEmployeeName} · {format(new Date(rec.date), "MMM d, yyyy")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
