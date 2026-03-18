# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Production build (static export)
npm run start        # Serve production build
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking (no emit)

# AI/Genkit
npm run genkit:dev   # Start Genkit dev UI
npm run genkit:watch # Start Genkit with file watching
```

There is no test suite in this project.

## Architecture

**ITG Connect** is an internal employee hub. It is a **statically exported Next.js 15 app** deployed to Firebase Hosting. All data lives in Firebase Firestore with real-time subscriptions; there is no backend API layer.

### Route Structure

Routes are split into two groups:
- `src/app/login/` — public, unauthenticated
- `src/app/(app)/` — all authenticated routes, protected by an auth guard in `src/app/(app)/layout.tsx`

The `(app)` layout does three things: redirects unauthentsted users to `/login`, renders the sidebar/header shell, and runs initialization hooks (`useFirestoreSeed`, `useEnsureEmployee`).

### Firebase Layer (`src/firebase/`)

- `config.ts` — Firebase project credentials (hardcoded, not env-based)
- `provider.tsx` — React context (`FirebaseContext`) providing `firebaseApp`, `firestore`, `auth`, `user`, `isUserLoading`. Use `useFirebase()`, `useAuth()`, `useUser()`, `useFirestore()` to consume.
- `client-provider.tsx` — Wraps the app with `FirebaseProvider`; initializes Firebase once via `useMemo`
- `firestore/use-collection.tsx` and `use-doc.tsx` — Low-level `onSnapshot` hooks

### Data Hooks (`src/hooks/use-firestore-data.ts`)

All Firestore collections are accessed through dedicated hooks with real-time `onSnapshot` listeners:

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
| `useFirestoreSeed()` | all | Auto-seeds on first load if empty |
| `useEnsureEmployee()` | `employees` | Creates record on first sign-in |

### UI Components

- `src/components/ui/` — shadcn/ui primitives (Radix UI + Tailwind). Do not modify these directly; regenerate via shadcn CLI.
- `src/components/dashboard/` — Feature components for dashboard sections (corners, achievements, ideas, events)
- `src/components/tools/` — Developer tool components (JSON viewer, Base64, timestamp, etc.)

### Types

All shared TypeScript types are in `src/lib/types.ts`: `Employee`, `Achievement`, `NewsArticle`, `SpecialAnnouncement`, `Idea`, `Recognition`, `Feedback`, `Event`.

### AI Features (`src/ai/`)

Uses Google Genkit (`@genkit-ai/google-genai`). Flows are in `src/ai/flows/`. Currently: `explain-api-response.ts` for the API Explainer developer tool.

### Static Export Constraints

Because `output: 'export'` is set in `next.config.ts`:
- No server-side rendering or server components with dynamic data
- No API routes
- Image optimization is disabled (`unoptimized: true`)
- All data fetching happens client-side via Firestore

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to Firebase Hosting on every push to `main`. Requires a `SERVICE_KEY` GitHub secret (Firebase service account JSON).
