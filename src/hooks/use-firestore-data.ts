"use client";

import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import type {
  Employee,
  Achievement,
  Recognition,
  Idea,
  Event,
  SpecialAnnouncement,
  NewsArticle,
  Feedback,
} from "@/lib/types";
import {
  employees as seedEmployees,
  achievements as seedAchievements,
  recognitions as seedRecognitions,
  ideas as seedIdeas,
  events as seedEvents,
  specialAnnouncements as seedAnnouncements,
  news as seedNews,
} from "@/lib/data";

// ─── Employees ───────────────────────────────────────────────────────────────
export function useEmployees() {
  const db = useFirestore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "employees"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEmployees(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Employee));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  const updateEmployee = async (id: string, data: Partial<Omit<Employee, "id">>) => {
    await updateDoc(doc(db, "employees", id), data);
  };

  return { employees, loading, updateEmployee };
}

// ─── Achievements ─────────────────────────────────────────────────────────────
export function useAchievements() {
  const db = useFirestore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "achievements"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAchievements(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Achievement));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  const addAchievement = async (achievement: Omit<Achievement, "id">) => {
    await addDoc(collection(db, "achievements"), achievement);
  };

  return { achievements, loading, addAchievement };
}

// ─── Recognitions ─────────────────────────────────────────────────────────────
export function useRecognitions() {
  const db = useFirestore();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "recognitions"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRecognitions(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Recognition));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  const addRecognition = async (recognition: Omit<Recognition, "id">) => {
    await addDoc(collection(db, "recognitions"), recognition);
  };

  return { recognitions, loading, addRecognition };
}

// ─── Ideas ────────────────────────────────────────────────────────────────────
export function useIdeas() {
  const db = useFirestore();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "ideas"), orderBy("votes", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setIdeas(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Idea));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  const vote = async (ideaId: string, userId: string, hasVoted: boolean) => {
    const ref = doc(db, "ideas", ideaId);
    await updateDoc(ref, {
      votedBy: hasVoted ? arrayRemove(userId) : arrayUnion(userId),
      votes: hasVoted ? increment(-1) : increment(1),
    });
  };

  const addIdea = async (idea: Omit<Idea, "id" | "votes" | "votedBy">) => {
    await addDoc(collection(db, "ideas"), { ...idea, votes: 0, votedBy: [] });
  };

  return { ideas, loading, vote, addIdea };
}

// ─── Events ───────────────────────────────────────────────────────────────────
export function useEvents() {
  const db = useFirestore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Event));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  const rsvp = async (eventId: string, userId: string, isRsvpd: boolean) => {
    const ref = doc(db, "events", eventId);
    await updateDoc(ref, {
      rsvps: isRsvpd ? arrayRemove(userId) : arrayUnion(userId),
    });
  };

  const addEvent = async (event: Omit<Event, "id">) => {
    await addDoc(collection(db, "events"), event);
  };

  return { events, loading, rsvp, addEvent };
}

// ─── Special Announcements ────────────────────────────────────────────────────
export function useAnnouncements() {
  const db = useFirestore();
  const [announcements, setAnnouncements] = useState<SpecialAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "specialAnnouncements"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAnnouncements(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as SpecialAnnouncement));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  const addAnnouncement = async (announcement: Omit<SpecialAnnouncement, "id">) => {
    await addDoc(collection(db, "specialAnnouncements"), announcement);
  };

  return { announcements, loading, addAnnouncement };
}

// ─── News ─────────────────────────────────────────────────────────────────────
export function useNews() {
  const db = useFirestore();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("publishedDate", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNews(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as NewsArticle));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  return { news, loading };
}

// ─── Ensure Employee Record ───────────────────────────────────────────────────
// Creates a Firestore employee doc for the logged-in user if one doesn't exist
export function useEnsureEmployee(user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null; isAnonymous?: boolean } | null) {
  const db = useFirestore();
  const { employees, loading } = useEmployees();

  useEffect(() => {
    if (loading || !user || user.isAnonymous) return;

    const exists = employees.some((e) => e.email === user.email);
    if (exists) return;

    const newEmployee = {
      name: user.displayName || user.email?.split("@")[0] || "New User",
      email: user.email || "",
      department: "",
      profilePhotoUrl: user.photoURL || "",
      profilePhotoHint: "person portrait",
      birthDate: "1990-01-01",
      achievements: [],
      workAnniversary: new Date().toISOString().split("T")[0],
    };

    // Use the uid as the doc id so it's stable
    import("firebase/firestore").then(({ setDoc, doc }) => {
      setDoc(doc(db, "employees", user.uid), newEmployee, { merge: true }).catch(console.error);
    });
  }, [user, employees, loading, db]);
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export function useFeedback() {
  const db = useFirestore();

  const submitFeedback = async (feedback: Omit<Feedback, "id">) => {
    await addDoc(collection(db, "feedback"), feedback);
  };

  return { submitFeedback };
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
export function useFirestoreSeed() {
  const db = useFirestore();

  useEffect(() => {
    async function seed() {
      try {
        // Check if already seeded by looking at ideas collection
        const snap = await getDocs(collection(db, "ideas"));
        if (!snap.empty) return;

        const batch = writeBatch(db);

        // Seed employees
        seedEmployees.forEach((emp) => {
          batch.set(doc(db, "employees", emp.id), emp);
        });

        // Seed achievements
        seedAchievements.forEach((ach) => {
          batch.set(doc(db, "achievements", ach.id), ach);
        });

        // Seed recognitions
        seedRecognitions.forEach((rec) => {
          batch.set(doc(db, "recognitions", rec.id), rec);
        });

        // Seed ideas (add votedBy field)
        seedIdeas.forEach((idea) => {
          batch.set(doc(db, "ideas", idea.id), { ...idea, votedBy: [] });
        });

        // Seed events
        seedEvents.forEach((ev) => {
          batch.set(doc(db, "events", ev.id), ev);
        });

        // Seed special announcements
        seedAnnouncements.forEach((ann) => {
          batch.set(doc(db, "specialAnnouncements", ann.id), ann);
        });

        // Seed news
        seedNews.forEach((article) => {
          batch.set(doc(db, "news", article.id), article);
        });

        await batch.commit();
        console.log("Firestore seeded with initial data.");
      } catch (err) {
        console.error("Seeding failed:", err);
      }
    }

    seed();
  }, [db]);
}
