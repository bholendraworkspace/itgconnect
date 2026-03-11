"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { employees } from "@/lib/data";
import type { Employee } from "@/lib/types";
import { parse, isToday, isFuture, isPast, differenceInDays, format } from "date-fns";
import { Cake, Gift } from "lucide-react";
import React from "react";

const BirthdayCard = ({ title, employees, colorClass }: { title: string, employees: Employee[], colorClass: string }) => {
  const { toast } = useToast();

  const handleSendWish = (name: string) => {
    toast({
      title: "Wish Sent!",
      description: `Your birthday wish has been sent to ${name}.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <Cake className={`h-5 w-5 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        {employees.length > 0 ? (
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.profilePhotoUrl} data-ai-hint={employee.profilePhotoHint} />
                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{format(parse(employee.birthDate, 'yyyy-MM-dd', new Date()), 'MMMM do')}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleSendWish(employee.name)}>
                  <Gift className="mr-2 h-4 w-4" /> Send Wish
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

export default function DashboardPage() {
  const today = new Date();

  const parseDate = (dateStr: string) => parse(dateStr, "yyyy-MM-dd", new Date());

  const birthdaysToday = employees.filter(e => isToday(parseDate(e.birthDate)));
  const upcomingBirthdays = employees.filter(e => {
    const bday = parseDate(e.birthDate);
    return isFuture(bday) && differenceInDays(bday, today) <= 7;
  }).sort((a,b) => differenceInDays(parseDate(a.birthDate), parseDate(b.birthDate)));
  const pastBirthdays = employees.filter(e => {
     const bday = parseDate(e.birthDate);
     return isPast(bday) && !isToday(bday) && differenceInDays(today, bday) <= 7;
  }).sort((a,b) => differenceInDays(parseDate(b.birthDate), parseDate(a.birthDate)));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="space-y-4">
        {birthdaysToday.length > 0 && <BirthdayCard title="Today's Birthdays" employees={birthdaysToday} colorClass="text-primary" />}
        {upcomingBirthdays.length > 0 && <BirthdayCard title="Upcoming Birthdays" employees={upcomingBirthdays} colorClass="text-accent" />}
        {pastBirthdays.length > 0 && <BirthdayCard title="Past Birthdays" employees={pastBirthdays} colorClass="text-muted-foreground" />}
      </div>
    </div>
  );
}
