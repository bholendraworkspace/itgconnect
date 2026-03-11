"use client";

import { BirthdayCorner, SpecialAnnouncementsCorner } from "@/components/dashboard/corners";
import { AchievementsCorner, RecognitionCorner } from "@/components/dashboard/achievements";
import { IdeasCorner } from "@/components/dashboard/ideas";
import { OrganizeEvent } from "@/components/dashboard/events";
import { employees, specialAnnouncements, achievements, recognitions, ideas, events, currentUser } from "@/lib/data";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            
            <div className="grid gap-8">
                {/* User details and personal corners */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <BirthdayCorner employees={employees} />
                    </div>
                    <div className="lg:col-span-1">
                        <SpecialAnnouncementsCorner announcements={specialAnnouncements} />
                    </div>
                </div>

                {/* Achievements and Recognition */}
                <div className="grid gap-8 md:grid-cols-2">
                    <AchievementsCorner achievements={achievements} />
                    <RecognitionCorner recognitions={recognitions} />
                </div>

                {/* Interactive sections */}
                <div className="grid gap-8">
                    <IdeasCorner initialIdeas={ideas} />
                    <OrganizeEvent initialEvents={events} currentUserId={currentUser?.id || '4'} />
                </div>
            </div>
        </div>
    );
}
