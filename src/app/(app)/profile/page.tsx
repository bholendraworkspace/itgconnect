"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import {
  Award, Edit, Mail, Building, Star, CalendarDays, Loader2, UserRound, Save,
  Phone, Globe, Heart, Briefcase, User, MapPin, CheckCircle2, AlertCircle,
  Sparkles, ChevronRight,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useUser } from "@/firebase";
import { useEmployees, useAchievements, useRecognitions } from "@/hooks/use-firestore-data";
import { useToast } from "@/hooks/use-toast";
import { cn, calculateCompletion } from "@/lib/utils";
import type { Employee } from "@/lib/types";

// ─── Profile Completion ──────────────────────────────────────────────────────



function ProfileCompletionCircle({ percentage }: { percentage: number }) {
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 100 ? "stroke-emerald-500" : percentage >= 60 ? "stroke-amber-500" : "stroke-red-500";
  const textColor = percentage >= 100 ? "text-emerald-500" : percentage >= 60 ? "text-amber-500" : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} className={color}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-xl font-bold", textColor)}>{percentage}%</span>
      </div>
    </div>
  );
}

// ─── Detail Row Helper ───────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value || <span className="text-muted-foreground italic">Not Set</span>}</p>
      </div>
    </div>
  );
}

// ─── Edit Form Tabs ──────────────────────────────────────────────────────────

type EditTab = "about" | "personal" | "contact" | "work";

export default function ProfilePage() {
  const { user } = useUser();
  const { employees, loading: empLoading, updateEmployee } = useEmployees();
  const { achievements, loading: achLoading } = useAchievements();
  const { recognitions, loading: recLoading } = useRecognitions();
  const { toast } = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTab, setEditTab] = useState<EditTab>("about");
  const [form, setForm] = useState({
    name: "", department: "", birthDate: "", workAnniversary: "", profilePhotoUrl: "",
    role: "", aboutMe: "", jobLove: "", interests: "",
    firstName: "", middleName: "", lastName: "", gender: "", maritalStatus: "", bloodGroup: "", marriageDate: "", nationality: "",
    personalEmail: "", mobileNumber: "", workNumber: "",
    businessUnit: "", subDepartment: "", reportingManager: "",
  });

  const isLoading = empLoading || achLoading || recLoading;

  const currentEmployee = user?.isAnonymous
    ? employees[0]
    : employees.find((e) => e.email === user?.email);

  const myAchievements = achievements.filter((a) => a.employeeId === currentEmployee?.id);
  const myRecognitions = recognitions.filter((r) => r.toEmployeeId === currentEmployee?.id);

  const completion = useMemo(() => currentEmployee ? calculateCompletion(currentEmployee) : { percentage: 0, missing: [] }, [currentEmployee]);

  const openSheet = (tab?: EditTab) => {
    setForm({
      name: currentEmployee?.name || "",
      department: currentEmployee?.department || "",
      birthDate: currentEmployee?.birthDate || "",
      workAnniversary: currentEmployee?.workAnniversary || "",
      profilePhotoUrl: currentEmployee?.profilePhotoUrl || "",
      role: currentEmployee?.role || "",
      aboutMe: currentEmployee?.aboutMe || "",
      jobLove: currentEmployee?.jobLove || "",
      interests: currentEmployee?.interests || "",
      firstName: currentEmployee?.firstName || "",
      middleName: currentEmployee?.middleName || "",
      lastName: currentEmployee?.lastName || "",
      gender: currentEmployee?.gender || "",
      maritalStatus: currentEmployee?.maritalStatus || "",
      bloodGroup: currentEmployee?.bloodGroup || "",
      marriageDate: currentEmployee?.marriageDate || "",
      nationality: currentEmployee?.nationality || "",
      personalEmail: currentEmployee?.personalEmail || "",
      mobileNumber: currentEmployee?.mobileNumber || "",
      workNumber: currentEmployee?.workNumber || "",
      businessUnit: currentEmployee?.businessUnit || "",
      subDepartment: currentEmployee?.subDepartment || "",
      reportingManager: currentEmployee?.reportingManager || "",
    });
    setEditTab(tab || "about");
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!currentEmployee) return;
    setSaving(true);
    try {
      await updateEmployee(currentEmployee.id, { ...form });
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
          <p className="text-sm text-muted-foreground">Loading profile...</p>
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

  const editTabs: { id: EditTab; label: string }[] = [
    { id: "about", label: "About" },
    { id: "personal", label: "Personal" },
    { id: "contact", label: "Contact" },
    { id: "work", label: "Work" },
  ];

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl mx-auto">
      {/* Profile hero card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative h-36 sm:h-44 bg-gradient-to-r from-primary via-rose-500 to-accent">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-8 bottom-0 h-20 w-20 rounded-full bg-white/10" />
        </div>

        <CardContent className="px-4 sm:px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-xl ring-2 ring-primary/20">
              <AvatarImage src={currentEmployee.profilePhotoUrl} />
              <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                {currentEmployee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button onClick={() => openSheet()} variant="outline" size="sm" className="mb-1 rounded-xl gap-2">
                  <Edit className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
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

                {/* Tab navigation */}
                <div className="flex border-b border-border/60">
                  {editTabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditTab(t.id)}
                      className={cn(
                        "flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px",
                        editTab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >{t.label}</button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  {editTab === "about" && (
                    <>
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

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Display Name</Label>
                          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Role / Designation</Label>
                          <Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} placeholder="e.g. Team Lead - Mobile Apps" className="rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">About Me</Label>
                          <Textarea value={form.aboutMe} onChange={(e) => setForm((f) => ({ ...f, aboutMe: e.target.value }))} placeholder="Introduce yourself..." className="rounded-xl min-h-[80px]" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">What I love about my job</Label>
                          <Textarea value={form.jobLove} onChange={(e) => setForm((f) => ({ ...f, jobLove: e.target.value }))} placeholder="Share what excites you..." className="rounded-xl min-h-[80px]" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Interests & Hobbies</Label>
                          <Textarea value={form.interests} onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))} placeholder="Your hobbies, interests..." className="rounded-xl min-h-[80px]" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Profile Photo URL</Label>
                          <Input value={form.profilePhotoUrl} onChange={(e) => setForm((f) => ({ ...f, profilePhotoUrl: e.target.value }))} placeholder="https://..." className="rounded-xl h-11" />
                        </div>
                      </div>
                    </>
                  )}

                  {editTab === "personal" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">First Name</Label>
                          <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Middle Name</Label>
                          <Input value={form.middleName} onChange={(e) => setForm((f) => ({ ...f, middleName: e.target.value }))} className="rounded-xl h-11" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Last Name</Label>
                        <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Gender</Label>
                        <Select value={form.gender} onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Date of Birth</Label>
                        <Input type="date" value={form.birthDate} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Marital Status</Label>
                        <Select value={form.maritalStatus} onValueChange={(v) => setForm((f) => ({ ...f, maritalStatus: v }))}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Marriage Date</Label>
                        <Input type="date" value={form.marriageDate} onChange={(e) => setForm((f) => ({ ...f, marriageDate: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Blood Group</Label>
                        <Select value={form.bloodGroup} onValueChange={(v) => setForm((f) => ({ ...f, bloodGroup: v }))}>
                          <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nationality</Label>
                        <Input value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} placeholder="e.g. India" className="rounded-xl h-11" />
                      </div>
                    </div>
                  )}

                  {editTab === "contact" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Work Email</Label>
                        <Input value={currentEmployee.email} disabled className="rounded-xl h-11 opacity-60 cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground">Managed by your sign-in provider.</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Personal Email</Label>
                        <Input value={form.personalEmail} onChange={(e) => setForm((f) => ({ ...f, personalEmail: e.target.value }))} placeholder="personal@email.com" className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Mobile Number</Label>
                        <Input value={form.mobileNumber} onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))} placeholder="+91-..." className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Work Number</Label>
                        <Input value={form.workNumber} onChange={(e) => setForm((f) => ({ ...f, workNumber: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                    </div>
                  )}

                  {editTab === "work" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Department</Label>
                        <Input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Business Unit</Label>
                        <Input value={form.businessUnit} onChange={(e) => setForm((f) => ({ ...f, businessUnit: e.target.value }))} placeholder="e.g. ITGD" className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Sub-Department</Label>
                        <Input value={form.subDepartment} onChange={(e) => setForm((f) => ({ ...f, subDepartment: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Reporting Manager</Label>
                        <Input value={form.reportingManager} onChange={(e) => setForm((f) => ({ ...f, reportingManager: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Work Anniversary</Label>
                        <Input type="date" value={form.workAnniversary} onChange={(e) => setForm((f) => ({ ...f, workAnniversary: e.target.value }))} className="rounded-xl h-11" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/60 px-6 py-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !form.name.trim()}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 shadow-md shadow-primary/30"
                  >
                    {saving ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentEmployee.name}</h1>
            {currentEmployee.role && (
              <p className="text-sm font-medium text-primary mt-0.5">{currentEmployee.role}</p>
            )}
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
              {currentEmployee.mobileNumber && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{currentEmployee.mobileNumber}</span>
                </div>
              )}
            </div>
          </div>

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

      {/* Profile Completion Card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className={cn("h-1 w-full bg-gradient-to-r", completion.percentage >= 100 ? "from-emerald-500 to-green-400" : "from-amber-500 to-orange-400")} />
        <CardContent className="px-4 sm:px-6 py-5">
          <div className="flex items-center gap-5">
            <ProfileCompletionCircle percentage={completion.percentage} />
            <div className="flex-1">
              {completion.percentage >= 100 ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-base font-bold text-emerald-600">Profile completed successfully!</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Great job! Your profile is fully up to date.</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h3 className="text-base font-bold">Complete your profile</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Missing: {completion.missing.slice(0, 3).join(", ")}{completion.missing.length > 3 ? ` +${completion.missing.length - 3} more` : ""}
                  </p>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs h-8 gap-1" onClick={() => openSheet("about")}>
                    Complete Now <ChevronRight className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Introduce Yourself / About */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-400" />
        <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-400 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Introduce yourself</CardTitle>
                <p className="text-xs text-muted-foreground">We would love to know more about yourself</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs gap-1" onClick={() => openSheet("about")}>
              <Edit className="h-3 w-3" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-5 space-y-4">
          {/* About */}
          <div className="rounded-xl bg-muted/40 p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
            {currentEmployee.role && (
              <p className="text-sm font-semibold text-foreground">{currentEmployee.role}</p>
            )}
            {currentEmployee.aboutMe ? (
              <p className="text-sm text-foreground mt-1 leading-relaxed">{currentEmployee.aboutMe}</p>
            ) : (
              <button onClick={() => openSheet("about")} className="text-sm text-primary hover:underline mt-1">Add a bio...</button>
            )}
          </div>

          {/* What I love */}
          <div className="rounded-xl bg-muted/40 p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What I love about my job?</h4>
            {currentEmployee.jobLove ? (
              <p className="text-sm text-foreground leading-relaxed">{currentEmployee.jobLove}</p>
            ) : (
              <button onClick={() => openSheet("about")} className="text-sm text-primary hover:underline">Add Response</button>
            )}
          </div>

          {/* Interests */}
          <div className="rounded-xl bg-muted/40 p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My interests and hobbies</h4>
            {currentEmployee.interests ? (
              <p className="text-sm text-foreground leading-relaxed">{currentEmployee.interests}</p>
            ) : (
              <button onClick={() => openSheet("about")} className="text-sm text-primary hover:underline">Add your interests...</button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Primary Details */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
        <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">Primary Details</CardTitle>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs gap-1" onClick={() => openSheet("personal")}>
              <Edit className="h-3 w-3" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0">
            <div>
              <DetailRow icon={<User className="h-4 w-4" />} label="First Name" value={currentEmployee.firstName} />
              <DetailRow icon={<User className="h-4 w-4" />} label="Middle Name" value={currentEmployee.middleName} />
              <DetailRow icon={<User className="h-4 w-4" />} label="Last Name" value={currentEmployee.lastName} />
              <DetailRow icon={<User className="h-4 w-4" />} label="Display Name" value={currentEmployee.name} />
              <DetailRow icon={<User className="h-4 w-4" />} label="Gender" value={currentEmployee.gender} />
            </div>
            <div>
              <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Date of Birth" value={currentEmployee.birthDate && currentEmployee.birthDate !== "1990-01-01" ? format(new Date(currentEmployee.birthDate), "dd MMM yyyy") : undefined} />
              <DetailRow icon={<Heart className="h-4 w-4" />} label="Marital Status" value={currentEmployee.maritalStatus} />
              <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Marriage Date" value={currentEmployee.marriageDate ? format(new Date(currentEmployee.marriageDate), "dd MMM yyyy") : undefined} />
              <DetailRow icon={<Heart className="h-4 w-4" />} label="Blood Group" value={currentEmployee.bloodGroup} />
              <DetailRow icon={<Globe className="h-4 w-4" />} label="Nationality" value={currentEmployee.nationality} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
        <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-sm">
                <Phone className="h-4 w-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">Contact Details</CardTitle>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs gap-1" onClick={() => openSheet("contact")}>
              <Edit className="h-3 w-3" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Work Email" value={currentEmployee.email} />
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Personal Email" value={currentEmployee.personalEmail} />
            <DetailRow icon={<Phone className="h-4 w-4" />} label="Mobile Number" value={currentEmployee.mobileNumber} />
            <DetailRow icon={<Phone className="h-4 w-4" />} label="Work Number" value={currentEmployee.workNumber} />
          </div>
        </CardContent>
      </Card>

      {/* Work Details */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-yellow-400" />
        <CardHeader className="px-4 sm:px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400 text-white shadow-sm">
                <Briefcase className="h-4 w-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">Work Details</CardTitle>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl text-xs gap-1" onClick={() => openSheet("work")}>
              <Edit className="h-3 w-3" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-5 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <DetailRow icon={<Building className="h-4 w-4" />} label="Business Unit" value={currentEmployee.businessUnit} />
            <DetailRow icon={<Building className="h-4 w-4" />} label="Department" value={currentEmployee.department} />
            <DetailRow icon={<Building className="h-4 w-4" />} label="Sub-Department" value={currentEmployee.subDepartment} />
            <DetailRow icon={<User className="h-4 w-4" />} label="Reporting Manager" value={currentEmployee.reportingManager} />
            <DetailRow icon={<CalendarDays className="h-4 w-4" />} label="Work Anniversary" value={currentEmployee.workAnniversary ? format(new Date(currentEmployee.workAnniversary), "dd MMM yyyy") : undefined} />
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
              <p className="text-xs text-muted-foreground">Your accomplishments at ITG</p>
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
                <p className="text-xs text-muted-foreground">Shoutouts from your teammates</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 pb-5">
            <div className="space-y-3">
              {myRecognitions.map((rec) => (
                <div key={rec.id} className="rounded-xl bg-muted/40 px-4 py-3">
                  <p className="text-sm text-foreground leading-relaxed">"{rec.message}"</p>
                  <p className="text-xs text-muted-foreground mt-1.5">-- {rec.fromEmployeeName} · {format(new Date(rec.date), "MMM d, yyyy")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
