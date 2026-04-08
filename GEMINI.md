# Project Overview: ITG Connect

ITG Connect is a modern internal employee hub designed to help ITG employees connect, celebrate achievements, share ideas, and stay informed. The platform is built as a single-page application and features a personalized dashboard, an employee directory, an achievements wall, peer-to-peer recognition, ideas submission, news & events, a feedback mechanism, and a suite of developer tools (including an AI-powered API response explainer).

## Tech Stack & Architecture

- **Framework:** Next.js 15 (App Router, exported statically via `out` directory)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui primitives (`src/components/ui/`)
- **Database:** Firebase Cloud Firestore (with real-time hooks located in `src/hooks/use-firestore-data.ts`)
- **Authentication:** Firebase Authentication (Google Sign-In)
- **Hosting:** Firebase Hosting (Configuration in `firebase.json`)
- **CI/CD:** GitHub Actions (Deploy workflow in `.github/workflows/deploy.yml`)
- **AI Integration:** Genkit (`@genkit-ai/google-genai`) utilized in `src/ai/` for the AI API response explainer.

### Route Structure
The application uses an App Router structure under `src/app/`, separated into:
- `src/app/login/` — public, unauthenticated routes.
- `src/app/(app)/` — authenticated routes protected by an auth guard in `src/app/(app)/layout.tsx`. This layout handles redirection, renders the app shell, and initializes core hooks (`useFirestoreSeed`, `useEnsureEmployee`).

### Data Hooks & Types
All Firestore collections are accessed via dedicated real-time `onSnapshot` hooks in `src/hooks/use-firestore-data.ts` (e.g., `useEmployees`, `useAchievements`, `useRecognitions`, `useIdeas`, `useEvents`, `useSpecialAnnouncements`, `useNews`, `useFeedback`).
All shared TypeScript types are housed in `src/lib/types.ts` (e.g., `Employee`, `Achievement`, `PageSpeedHistory`, `ApiProject`, etc.).

### UI Components
- `src/components/ui/`: shadcn/ui primitives. **Do not modify these directly; regenerate via shadcn CLI.**
- `src/components/dashboard/`: Core feature components (corners, achievements, ideas with aligned like/unlike buttons, events, etc.).
- `src/components/tools/`: 20+ Developer tool components (JSON viewer, PageSpeed Insights, Hash Generator, API Collection, etc.).

## Building and Running

### Development

To start the local development server:
```bash
npm run dev
```
*(Runs `next dev --turbopack`)*

To run Genkit for the AI features during development:
```bash
npm run genkit:dev
# Or for watch mode:
npm run genkit:watch
```

### Building for Production

The application is configured to build as a static export (into the `out/` directory).
```bash
npm run build
```

### Deployment

The application is deployed to Firebase Hosting.
Manual deployment command:
```bash
npx firebase-tools@latest deploy --only hosting --project YOUR_PROJECT_ID
```
*(Automated deployments occur via GitHub Actions on push to the `main` branch).*

### Type Checking & Linting

- **Type Checking:** `npm run typecheck`
- **Linting:** `npm run lint`

## Development Conventions

- **Firebase Integration:** Firebase credentials and configuration are maintained in `src/firebase/config.ts`. The project utilizes custom React hooks (`use-firestore-data.ts`) to interact with Firestore collections like `employees`, `achievements`, `ideas`, etc. When modifying data structures, ensure corresponding types in `src/lib/types.ts` are updated.
- **Styling & UI:** The project strongly relies on Tailwind CSS and shadcn/ui. Stick to these tools for styling and use existing components (found in `src/components/ui/`) instead of creating custom alternatives when possible.
- **UserNav Avatar:** The header user avatar (`src/components/user-nav.tsx`) features a circular SVG progress ring showing profile completion percentage, with a centered avatar and a percentage badge below. The ring turns emerald-green at 100%.
- **Design Language:** 
  - Primary visual elements utilize a dynamic linear gradient (`103deg, #FF006A 0%, #FF7A00 100%`).
  - Background color is a light desaturated blue-grey (`#EBEEF6`).
  - Typography uses the 'Inter' typeface for a modern grotesque sans-serif aesthetic.
- **Static Export Limitations:** Because the application is configured as a static export (`output: 'export'` expected in `next.config.ts`), avoid utilizing server-side Next.js features like `getServerSideProps` or dynamic server-side API routes within the App Router.
- **First Load/Seeding:** The application is designed to auto-seed Firestore with sample data (employees, achievements, etc.) upon the first load if the database is empty. Logic for this likely resides alongside the authentication or data fetching processes.
