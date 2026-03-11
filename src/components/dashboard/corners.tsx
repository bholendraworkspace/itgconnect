import { type Employee, type SpecialAnnouncement } from "@/lib/types";
import { parse, isToday, isFuture, isPast, differenceInDays, format } from "date-fns";
import { Cake, Gift, Home, Baby, Car, Briefcase } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type BirthdayCardProps = {
    title: string;
    employees: Employee[];
    colorClass: string;
};

export const BirthdayCard = ({ title, employees, colorClass }: BirthdayCardProps) => {
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
                    <div className="space-y-4 mt-4">
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
                    <p className="text-sm text-muted-foreground mt-4">No {title.toLowerCase()} this week.</p>
                )}
            </CardContent>
        </Card>
    );
};

export function BirthdayCorner({ employees }: { employees: Employee[] }) {
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
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">Birthday Corner</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {birthdaysToday.length > 0 && <BirthdayCard title="Today's Birthdays" employees={birthdaysToday} colorClass="text-primary" />}
                {upcomingBirthdays.length > 0 && <BirthdayCard title="Upcoming Birthdays" employees={upcomingBirthdays} colorClass="text-accent" />}
                {pastBirthdays.length > 0 && <BirthdayCard title="Past Birthdays" employees={pastBirthdays} colorClass="text-muted-foreground" />}
                {birthdaysToday.length === 0 && upcomingBirthdays.length === 0 && pastBirthdays.length === 0 && (
                     <p className="text-sm text-muted-foreground col-span-full">No birthdays this week.</p>
                )}
            </div>
        </div>
    );
}

const AnnouncementIcon = ({ type }: { type: SpecialAnnouncement['type'] }) => {
    switch (type) {
        case 'car': return <Car className="h-5 w-5 text-blue-500" />;
        case 'home': return <Home className="h-5 w-5 text-green-500" />;
        case 'kid': return <Baby className="h-5 w-5 text-pink-500" />;
        case 'marriage': return <Gift className="h-5 w-5 text-purple-500" />;
        case 'work_anniversary': return <Briefcase className="h-5 w-5 text-yellow-500" />;
        default: return <Gift className="h-5 w-5 text-gray-500" />;
    }
};

const formatAnnouncementType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export function SpecialAnnouncementsCorner({ announcements }: { announcements: SpecialAnnouncement[] }) {
     const { toast } = useToast();

     const handleCongratulate = (name: string, type: string) => {
         toast({
             title: "Congratulations Sent!",
             description: `You congratulated ${name} on their new ${formatAnnouncementType(type).toLowerCase()}.`,
         });
     };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold tracking-tight">Special Announcements</CardTitle>
            </CardHeader>
            <CardContent>
                {announcements.length > 0 ? (
                    <div className="space-y-6">
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={announcement.employeePhotoUrl} />
                                        <AvatarFallback>{announcement.employeeName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-lg">{announcement.employeeName}</p>
                                            <AnnouncementIcon type={announcement.type} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatAnnouncementType(announcement.type)} • {format(new Date(announcement.date), 'MMM do, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleCongratulate(announcement.employeeName, announcement.type)}>
                                    Congratulate
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No special announcements at this time.</p>
                )}
            </CardContent>
        </Card>
    );
}
