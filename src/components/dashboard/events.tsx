"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Users, Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useEvents, useEmployees } from "@/hooks/use-firestore-data";
import { useUser } from "@/firebase";

export function OrganizeEvent() {
  const { toast } = useToast();
  const { events, rsvp, addEvent, updateEvent, deleteEvent } = useEvents();
  const { employees } = useEmployees();
  const { user } = useUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", location: "" });

  const uid = user?.uid || "anonymous";
  const currentEmployee = employees.find((e) => e.email === user?.email) || employees.find((e) => e.id === "4");

  const handleCreate = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast({ title: "Missing fields", description: "Please fill in title, date, and location.", variant: "destructive" });
      return;
    }
    await addEvent({
      title: newEvent.title,
      description: newEvent.description,
      date: new Date(newEvent.date).toISOString(),
      location: newEvent.location,
      organizerId: uid,
      rsvps: [uid],
    });
    setIsCreateOpen(false);
    setNewEvent({ title: "", description: "", date: "", location: "" });
    toast({ title: "🎉 Event Created!", description: `"${newEvent.title}" has been added.` });
  };

  const openEdit = (event: typeof events[0]) => {
    setNewEvent({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
    });
    setEditId(event.id);
  };

  const handleUpdate = async () => {
    if (!editId || !newEvent.title || !newEvent.date || !newEvent.location) return;
    await updateEvent(editId, {
      title: newEvent.title,
      description: newEvent.description,
      date: new Date(newEvent.date).toISOString(),
      location: newEvent.location,
    });
    setEditId(null);
    setNewEvent({ title: "", description: "", date: "", location: "" });
    toast({ title: "Event Updated", description: "Your changes have been saved." });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEvent(deleteId);
    setDeleteId(null);
    toast({ title: "Event Deleted", description: "The event has been removed." });
  };

  const handleRSVP = async (eventId: string, isRsvpd: boolean) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    await rsvp(eventId, uid, isRsvpd);
    toast({
      title: isRsvpd ? "RSVP Cancelled" : "🎟️ RSVP Confirmed!",
      description: `You have ${isRsvpd ? "cancelled your RSVP for" : "RSVP'd to"} ${ev.title}.`,
    });
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 sm:px-5">
        <div>
          <CardTitle className="section-title text-lg sm:text-xl">Events</CardTitle>
          <CardDescription className="text-xs mt-0.5">Upcoming company events & townhalls</CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-sm hover:opacity-90 transition-opacity">
              <Plus className="mr-1 h-4 w-4" /><span className="hidden sm:inline">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="gradient-text">Create New Event</DialogTitle>
              <DialogDescription>Fill in the details to organize a new event.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5"><Label>Title <span className="text-primary">*</span></Label><Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g., Q3 Townhall" className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Date & Time <span className="text-primary">*</span></Label><Input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Location <span className="text-primary">*</span></Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Main Auditorium / Zoom" className="rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Brief description…" className="rounded-xl resize-none" rows={3} /></div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleCreate} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:opacity-90">Save Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const isRsvpd = event.rsvps.includes(uid);
            const isOwner = event.organizerId === uid;
            return (
              <Card key={event.id} className={`flex flex-col overflow-hidden border transition-all duration-300 ${isRsvpd ? "border-emerald-300/50 shadow-md shadow-emerald-500/10" : "border-border hover:border-emerald-200/50 hover:shadow-sm"}`}>
                <div className={`h-1 w-full ${isRsvpd ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-muted"}`} />
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold leading-snug flex-1">{event.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {isRsvpd && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><Check className="mr-1 h-3 w-3" /> Going</Badge>}
                      {isOwner && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(event)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => setDeleteId(event.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarIcon className="h-3.5 w-3.5 shrink-0 text-emerald-500" /><span>{format(new Date(event.date), "PPp")}</span></div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" /><span className="truncate">{event.location}</span></div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow px-4 pb-2">
                  {event.description && <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>}
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /><span>{event.rsvps.length} attending</span></div>
                </CardContent>
                <CardFooter className="px-4 pb-4">
                  <Button size="sm" variant={isRsvpd ? "outline" : "default"}
                    className={`w-full rounded-xl text-xs font-semibold transition-all duration-200 ${isRsvpd ? "border-emerald-300 text-emerald-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600" : "bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-0 hover:opacity-90"}`}
                    onClick={() => handleRSVP(event.id, isRsvpd)}>
                    {isRsvpd ? <><X className="mr-1.5 h-3.5 w-3.5" />Cancel RSVP</> : <><Check className="mr-1.5 h-3.5 w-3.5" />RSVP Now</>}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {events.length === 0 && <p className="col-span-full text-sm text-muted-foreground">No events yet. Create the first one!</p>}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={(open) => { if (!open) { setEditId(null); setNewEvent({ title: "", description: "", date: "", location: "" }); } }}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Title <span className="text-primary">*</span></Label><Input value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Date & Time <span className="text-primary">*</span></Label><Input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Location <span className="text-primary">*</span></Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="rounded-xl resize-none" rows={3} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditId(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleUpdate} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:opacity-90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Event?</DialogTitle>
            <DialogDescription>This action cannot be undone. The event and all RSVPs will be permanently removed.</DialogDescription>
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
