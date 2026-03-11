"use client";

import { useState } from "react";
import { type Event } from "@/lib/types";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, Plus, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function OrganizeEvent({ initialEvents, currentUserId }: { initialEvents: Event[], currentUserId: string }) {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();

    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
    });

    const handleCreateEvent = () => {
        if (!newEvent.title || !newEvent.date || !newEvent.location) {
            toast({
                title: "Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        const newEventObj: Event = {
            id: `ev-${Date.now()}`,
            title: newEvent.title,
            description: newEvent.description,
            date: new Date(newEvent.date).toISOString(),
            location: newEvent.location,
            organizerId: currentUserId,
            rsvps: [currentUserId], // Organizer is RSVP'd by default
        };

        setEvents(prev => [...prev, newEventObj]);
        setIsCreateOpen(false);
        setNewEvent({ title: '', description: '', date: '', location: '' });
        toast({
            title: "Success",
            description: "Event created successfully.",
        });
    };

    const handleRSVP = (eventId: string) => {
        setEvents(prevEvents => 
            prevEvents.map(event => {
                if (event.id === eventId) {
                    const isRsvpd = event.rsvps.includes(currentUserId);
                    const newRsvps = isRsvpd 
                        ? event.rsvps.filter(id => id !== currentUserId)
                        : [...event.rsvps, currentUserId];
                    
                    toast({
                        title: isRsvpd ? "RSVP Cancelled" : "RSVP Successful",
                        description: `You have ${isRsvpd ? 'cancelled your RSVP for' : 'RSVP\'d to'} ${event.title}.`,
                    });
                    
                    return { ...event, rsvps: newRsvps };
                }
                return event;
            })
        );
    };

    return (
        <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">Organize Event</CardTitle>
                    <CardDescription>Upcoming company events and townhalls.</CardDescription>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                            <DialogDescription>
                                Fill in the details to organize a new event, like a Townhall or Meetup.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Title</Label>
                                <Input 
                                    id="title" 
                                    value={newEvent.title} 
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} 
                                    placeholder="e.g., Q3 Townhall" 
                                    className="col-span-3" 
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">Date & Time</Label>
                                <Input 
                                    id="date" 
                                    type="datetime-local" 
                                    value={newEvent.date} 
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} 
                                    className="col-span-3" 
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">Location</Label>
                                <Input 
                                    id="location" 
                                    value={newEvent.location} 
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} 
                                    placeholder="e.g., Main Auditorium / Zoom Link" 
                                    className="col-span-3" 
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="description" className="text-right mt-2">Description</Label>
                                <Textarea 
                                    id="description" 
                                    value={newEvent.description} 
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} 
                                    placeholder="Brief description of the event..." 
                                    className="col-span-3" 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreateEvent}>Save Event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => {
                        const isRsvpd = event.rsvps.includes(currentUserId);
                        return (
                            <Card key={event.id} className="flex flex-col h-full border-muted-foreground/20">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{event.title}</CardTitle>
                                        {isRsvpd && <Badge variant="secondary"><Check className="mr-1 h-3 w-3" /> Going</Badge>}
                                    </div>
                                    <div className="flex flex-col space-y-1 mt-2 text-sm text-muted-foreground">
                                        <div className="flex items-center">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            <span>{format(new Date(event.date), 'PPp')}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm mt-2">{event.description}</p>
                                    <div className="flex items-center mt-4 text-sm text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>{event.rsvps.length} RSVP{event.rsvps.length !== 1 ? 's' : ''}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        variant={isRsvpd ? "outline" : "default"} 
                                        className="w-full" 
                                        onClick={() => handleRSVP(event.id)}
                                    >
                                        {isRsvpd ? 'Cancel RSVP' : 'RSVP Now'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
