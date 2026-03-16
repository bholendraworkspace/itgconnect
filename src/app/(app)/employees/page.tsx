"use client";

import { useState, useMemo } from "react";
import { useEmployees } from "@/hooks/use-firestore-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Mail, Cake, Briefcase, Award, Star } from "lucide-react";
import { format, parse } from "date-fns";
import type { Employee } from "@/lib/types";

function formatDate(dateStr: string): string {
  try {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return format(parsed, "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EmployeesPage() {
  const { employees, loading } = useEmployees();
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const departments = useMemo(() => {
    const depts = employees
      .map((e) => e.department)
      .filter((d): d is string => !!d);
    return ["All", ...Array.from(new Set(depts)).sort()];
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(q) ||
        (e.department?.toLowerCase().includes(q) ?? false);
      const matchesDept =
        activeDept === "All" || e.department === activeDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, search, activeDept]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-rose-500 to-accent p-6 text-white shadow-xl shadow-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white/80">Team Directory</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight">Our People</h1>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              {loading ? "..." : `${employees.length} members`}
            </Badge>
          </div>
          <p className="mt-1 text-white/70 text-sm">
            Meet the talented people who make ITG great.
          </p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-white/10" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or department..."
          className="pl-9 rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Department filter pills */}
      {!loading && departments.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={
                activeDept === dept
                  ? "rounded-full px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-primary to-accent text-white shadow-sm transition-all"
                  : "rounded-full px-4 py-1.5 text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
              }
            >
              {dept}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-0 shadow-md">
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No employees found.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((employee) => (
            <Card
              key={employee.id}
              className="card-hover rounded-2xl border-0 shadow-md cursor-pointer"
              onClick={() => setSelectedEmployee(employee)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <Avatar className="h-16 w-16 ring-2 ring-primary/30 shadow-sm mt-1">
                  <AvatarImage
                    src={employee.profilePhotoUrl}
                    data-ai-hint={employee.profilePhotoHint}
                    alt={employee.name}
                  />
                  <AvatarFallback className="text-base font-bold bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 w-full">
                  <p className="font-semibold text-sm leading-tight truncate">
                    {employee.name}
                  </p>
                  {employee.department && (
                    <Badge variant="secondary" className="text-xs">
                      {employee.department}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {employee.email}
                  </p>
                  {employee.workAnniversary && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      {format(
                        parse(employee.workAnniversary, "yyyy-MM-dd", new Date()),
                        "MMM yyyy"
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Employee detail sheet */}
      <Sheet
        open={!!selectedEmployee}
        onOpenChange={(open) => {
          if (!open) setSelectedEmployee(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
          {selectedEmployee && (
            <>
              {/* Gradient accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-rose-500 to-accent" />

              <div className="p-6 space-y-6">
                <SheetHeader>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/20 shadow-lg">
                      <AvatarImage
                        src={selectedEmployee.profilePhotoUrl}
                        data-ai-hint={selectedEmployee.profilePhotoHint}
                        alt={selectedEmployee.name}
                      />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                        {getInitials(selectedEmployee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-xl">{selectedEmployee.name}</SheetTitle>
                      {selectedEmployee.department && (
                        <Badge className="mt-1 bg-gradient-to-r from-primary to-accent text-white border-0">
                          {selectedEmployee.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                </SheetHeader>

                {/* Info rows */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm break-all">{selectedEmployee.email}</span>
                  </div>

                  {selectedEmployee.department && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                      <Briefcase className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{selectedEmployee.department}</span>
                    </div>
                  )}

                  {selectedEmployee.birthDate && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                      <Cake className="h-4 w-4 text-pink-400 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Birthday</p>
                        <p className="text-sm font-medium">
                          {formatDate(selectedEmployee.birthDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedEmployee.workAnniversary && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                      <Star className="h-4 w-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Work Anniversary</p>
                        <p className="text-sm font-medium">
                          {formatDate(selectedEmployee.workAnniversary)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-amber-400" />
                    <h3 className="font-semibold text-sm">Achievements</h3>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {selectedEmployee.achievements?.length ?? 0}
                    </Badge>
                  </div>

                  {!selectedEmployee.achievements ||
                  selectedEmployee.achievements.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                      <Award className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No achievements yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEmployee.achievements.map((ach) => (
                        <div
                          key={ach.id}
                          className="rounded-xl border border-border/60 bg-amber-50/50 dark:bg-amber-950/20 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-snug">{ach.title}</p>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {ach.date
                                ? format(new Date(ach.date), "MMM yyyy")
                                : ""}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {ach.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
