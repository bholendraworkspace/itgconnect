"use client";

import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  getDocs,
  getDoc,
  setDoc,
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

// ─── Known seed document IDs ─────────────────────────────────────────────────
const SEED_EMPLOYEE_IDS = new Set(seedEmployees.map((e) => e.id));
const SEED_COLLECTIONS: { name: string; ids: Set<string> }[] = [
  { name: "achievements", ids: new Set(seedAchievements.map((a) => a.id)) },
  { name: "recognitions", ids: new Set(seedRecognitions.map((r) => r.id)) },
  { name: "ideas", ids: new Set(seedIdeas.map((i) => i.id)) },
  { name: "events", ids: new Set(seedEvents.map((e) => e.id)) },
  { name: "specialAnnouncements", ids: new Set(seedAnnouncements.map((a) => a.id)) },
  { name: "news", ids: new Set(seedNews.map((n) => n.id)) },
];

// ─── Clear Dummy Data ────────────────────────────────────────────────────────
// Deletes all seed/dummy documents but preserves real Google-logged-in user records.
export async function clearDummyData(db: ReturnType<typeof useFirestore>) {
  const batch = writeBatch(db);

  // Delete seed employees only (real users have Firebase UIDs as IDs, not '1'-'13')
  const empSnap = await getDocs(collection(db, "employees"));
  empSnap.docs.forEach((d) => {
    if (SEED_EMPLOYEE_IDS.has(d.id)) {
      batch.delete(d.ref);
    }
  });

  // Delete seed docs from all other collections
  for (const { name, ids } of SEED_COLLECTIONS) {
    const snap = await getDocs(collection(db, name));
    snap.docs.forEach((d) => {
      if (ids.has(d.id)) {
        batch.delete(d.ref);
      }
    });
  }

  // Mark that dummy data has been cleared so seed doesn't re-run
  batch.set(doc(db, "_meta", "seeded"), { cleared: true });

  await batch.commit();
  console.log("Dummy data cleared. Real user data preserved.");
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
export function useFirestoreSeed(user: { uid: string } | null) {
  const db = useFirestore();

  useEffect(() => {
    // Wait until user is authenticated so Firestore has the auth token
    if (!user) return;

    async function seed() {
      try {
        // Skip seeding if dummy data was explicitly cleared
        const metaSnap = await getDoc(doc(db, "_meta", "seeded"));
        if (metaSnap.exists() && metaSnap.data()?.cleared) return;

        const [ideasSnap, empSnap] = await Promise.all([
          getDocs(collection(db, "ideas")),
          getDocs(collection(db, "employees")),
        ]);

        const existingEmpIds = new Set(empSnap.docs.map((d) => d.id));
        const missingEmps = seedEmployees.filter((e) => !existingEmpIds.has(e.id));
        const needsFullSeed = ideasSnap.empty;

        if (missingEmps.length === 0 && !needsFullSeed) return;

        const batch = writeBatch(db);

        // Always add any missing employees (handles new seed data additions)
        missingEmps.forEach((emp) => {
          batch.set(doc(db, "employees", emp.id), emp);
        });

        if (needsFullSeed) {
          // Full first-time seed for all other collections
          seedAchievements.forEach((ach) => {
            batch.set(doc(db, "achievements", ach.id), ach);
          });
          seedRecognitions.forEach((rec) => {
            batch.set(doc(db, "recognitions", rec.id), rec);
          });
          seedIdeas.forEach((idea) => {
            batch.set(doc(db, "ideas", idea.id), { ...idea, votedBy: [] });
          });
          seedEvents.forEach((ev) => {
            batch.set(doc(db, "events", ev.id), ev);
          });
          seedAnnouncements.forEach((ann) => {
            batch.set(doc(db, "specialAnnouncements", ann.id), ann);
          });
          seedNews.forEach((article) => {
            batch.set(doc(db, "news", article.id), article);
          });
        }

        await batch.commit();
        console.log("Firestore seeded/updated with new data.");
      } catch (err) {
        console.error("Seeding failed:", err);
      }
    }

    seed();
  }, [db, user]);
}
