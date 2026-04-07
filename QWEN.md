# ITG Connect — Project Context

## Project Overview

**ITG Connect** is a modern internal employee hub built with **Next.js 15**, **Firebase**, and **Tailwind CSS**. It provides ITG employees with a centralized platform to connect, celebrate achievements, share ideas, and stay informed.

The application is a **statically exported Next.js 15 app** deployed to Firebase Hosting. All data lives in Firebase Firestore with real-time subscriptions; there is no backend API layer.

**Live Site:** https://studio-1240945126-b5f6c.web.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix UI primitives) |
| Charts | Recharts |
| Forms | React Hook Form + Zod validation |
| Database | Firebase Cloud Firestore |
| Auth | Firebase Authentication (Google Sign-In) |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions (auto-deploy on push to `main`) |
| AI | Google Genkit (`@genkit-ai/google-genai`) |

---

## Key Commands

```bash
# Development
npm install              # Install dependencies
npm run dev              # Start dev server with Turbopack
npm run build            # Production build (static export to /out)
npm run start            # Serve production build locally
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking (no emit)

# AI / Genkit
npm run genkit:dev       # Start Genkit dev UI
npm run genkit:watch     # Start Genkit with file watching

# Deployment (manual)
npm run build
npx firebase-tools@latest deploy --only hosting --project studio-1240945126-b5f6c
```

There is **no test suite** in this project.

---

## Project Structure

```
src/
├── ai/                          # Google Genkit AI flows
│   └── flows/                   # e.g., explain-api-response.ts
├── app/
│   ├── (app)/                   # Authenticated routes (protected by layout guard)
│   │   ├── dashboard/           # Main dashboard page
│   │   ├── employees/           # People directory with profile sheets
│   │   ├── achievements/        # Achievements wall
│   │   ├── news/                # News & events
│   │   ├── tools/               # Developer tools
│   │   ├── feedback/            # Feedback form
│   │   ├── profile/             # User profile & edit
│   │   └── layout.tsx           # App shell (sidebar, header, auth guard)
│   ├── login/                   # Public login page (Google Sign-In)
│   ├── globals.css              # Design tokens & global styles
│   └── layout.tsx               # Root layout with Firebase provider
├── components/
│   ├── dashboard/               # Feature components (Birthday, Announcements, etc.)
│   ├── tools/                   # Developer tool components (JSON viewer, Base64, etc.)
│   ├── ui/                      # shadcn/ui primitives (do not modify manually)
│   ├── app-nav.tsx              # Sidebar navigation
│   └── user-nav.tsx             # Header user dropdown
├── firebase/                    # Firebase init & React providers
│   ├── config.ts                # Firebase credentials (hardcoded)
│   ├── provider.tsx             # FirebaseContext + useFirebase/useAuth/useUser/useFirestore
│   └── firestore/
│       ├── use-collection.tsx   # Low-level onSnapshot hook
│       └── use-doc.tsx          # Low-level document hook
├── hooks/
│   └── use-firestore-data.ts    # High-level hooks for all collections + seeding
└── lib/
    ├── types.ts                 # All shared TypeScript types
    └── data.ts                  # Seed data for first-load auto-seeding
```

---

## Architecture

### Authentication & Routing

- Routes split: `src/app/login/` (public) vs `src/app/(app)/` (authenticated).
- The `(app)` layout (`src/app/(app)/layout.tsx`) handles:
  - Redirects unauthenticated users to `/login`
  - Renders sidebar + header shell
  - Runs initialization hooks (`useFirestoreSeed`, `useEnsureEmployee`)

### Firebase Layer

- **`src/firebase/config.ts`** — Firebase project credentials (hardcoded, not env-based).
- **`src/firebase/provider.tsx`** — React context (`FirebaseContext`) providing `firebaseApp`, `firestore`, `auth`, `user`, `isUserLoading`. Access via `useFirebase()`, `useAuth()`, `useUser()`, `useFirestore()`.
- **`src/firebase/client-provider.tsx`** — Wraps app with `FirebaseProvider`; initializes Firebase once via `useMemo`.

### Data Access (Firestore Hooks)

All Firestore collections are accessed through dedicated hooks in `src/hooks/use-firestore-data.ts` with real-time `onSnapshot` listeners:

| Hook | Collection | Notes |
|------|-----------|-------|
| `useEmployees()` | `employees` | Auto-created on first Google Sign-In |
| `useAchievements()` | `achievements` | |
| `useRecognitions()` | `recognitions` | Includes add/delete |
| `useIdeas()` | `ideas` | Tracks `votedBy` array for voting |
| `useEvents()` | `events` | RSVP management |
| `useSpecialAnnouncements()` | `specialAnnouncements` | Life milestones |
| `useNews()` | `news` | |
| `useFeedback()` | `feedback` | |
| `useFirestoreSeed()` | all | Auto-seeds on first load if collections are empty |
| `useEnsureEmployee()` | `employees` | Creates employee record on first sign-in |

### Firestore Collections

| Collection | Description |
|------------|-------------|
| `employees` | Employee records (auto-created on first Google Sign-In) |
| `achievements` | Achievement entries |
| `recognitions` | Peer-to-peer recognition messages |
| `ideas` | Ideas with vote counts and `votedBy` tracking |
| `events` | Events with RSVP attendee lists |
| `specialAnnouncements` | Life milestone posts (car, home, kid, marriage, work anniversary) |
| `news` | News articles |
| `feedback` | User-submitted feedback (anonymous or named) |
| `pageSpeedHistories` | Page speed monitoring history |
| `apiProjects` | API project metadata |

### UI Components

- **`src/components/ui/`** — shadcn/ui primitives (Radix UI + Tailwind). Do not modify manually; regenerate via shadcn CLI.
- **`src/components/dashboard/`** — Feature components for dashboard sections.
- **`src/components/tools/`** — 20+ Developer tools (JSON Viewer, PageSpeed Insights, API Collection, Hash Generator, Base64 Tool, API Explainer, etc.).

### TypeScript Types

All shared types are in `src/lib/types.ts`:
- **`Employee`** — Full employee profile (contact, work, personal details)
- **`Achievement`** — Employee achievements
- **`NewsArticle`** — News articles
- **`SpecialAnnouncement`** — Life milestones (car, home, kid, marriage, work_anniversary)
- **`Idea`** — Ideas with `votedBy: string[]` for one-vote-per-user tracking
- **`Recognition`** — Peer recognition messages
- **`Feedback`** — User feedback (suggestion, bug, praise, other)
- **`Event`** — Events with `rsvps: string[]`
- **`ApiProject`** / **`ApiEndpoint`** / **`ApiFolder`** — API documentation structures
- **`PageSpeedHistory`** — Page speed tracking entries

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Google Sign-In via Firebase Auth |
| **Dashboard** | Personalized greeting, birthday corner, special announcements, achievements, recognition, ideas, and events |
| **People Directory** | Browse all employees with search and department filter; click any card to view full profile in a side panel |
| **Birthday Corner** | Today's, upcoming, and recent birthdays with one-click wishes |
| **Special Announcements** | Post and celebrate life milestones (new car, home, baby, marriage, work anniversary) |
| **Achievements** | Company-wide wall of fame |
| **Recognition** | Peer-to-peer shout-outs with a "Give Recognition" dialog |
| **Ideas Corner** | Submit ideas and vote (one vote per user, tracked in Firestore) |
| **Events** | Create events and RSVP with real-time attendee count |
| **News & Events** | Company announcements with featured images |
| **Feedback** | Submit suggestions, bug reports, or praise — anonymously or named |
| **Developer Tools** | JSON Viewer, HTML Viewer, Base64 Tool, Timestamp Converter, AMP Validator, API Collection, Color Converter, CSS Gradient Generator, CSS Minifier, Hash Generator, HTML Formatter, JWT Decoder, Markdown Preview, PageSpeed Insights, Password Generator, Purge URL, Schema Checker, Text Diff, URL Encoder, UUID Generator, API Explainer (AI-powered) |
| **Profile** | User profile with achievements and stats |

---

## Static Export Constraints

Because `output: 'export'` is set in `next.config.ts`:
- **No server-side rendering** or server components with dynamic data
- **No API routes**
- **Image optimization disabled** (`unoptimized: true`)
- All data fetching happens **client-side** via Firestore

---

## Deployment

### CI/CD (GitHub Actions)

Every push to `main` automatically builds and deploys to Firebase Hosting via `.github/workflows/deploy.yml`.

**Required GitHub secret:**

| Secret | Value |
|--------|-------|
| `SERVICE_KEY` | Firebase service account JSON (Firebase Console → Project Settings → Service Accounts) |

### Firebase Configuration

- **`firebase.json`** — Hosting config: static `out` directory, clean URLs, SPA rewrite, caching headers
- **`firestore.rules`** — Firestore security rules
- **`.firebaserc`** — Firebase project alias

---

## Development Conventions

- **Path aliases:** `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- **shadcn/ui:** UI components in `src/components/ui/` are auto-generated; do not hand-edit
- **Tailwind:** Custom theme tokens defined in `tailwind.config.ts` using CSS variables
- **No tests:** This project currently has no test suite
- **First-load seeding:** Firestore auto-seeds with sample data if collections are empty
- **Node.js version:** 22+ required
