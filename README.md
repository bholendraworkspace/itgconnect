# ITG Connect

A modern internal employee hub built with Next.js, Firebase, and Tailwind CSS. Designed to help ITG employees connect, celebrate achievements, share ideas, and stay informed — all in one beautifully designed platform.

## Live Site

**[https://studio-1240945126-b5f6c.web.app](https://studio-1240945126-b5f6c.web.app)**

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | Google Sign-In via Firebase Auth |
| **Dashboard** | Personalized greeting, birthday corner, special announcements, achievements, recognition, ideas, and events |
| **People Directory** | Browse all employees with search and department filter; click any card to view full profile in a side panel |
| **Birthday Corner** | Today's, upcoming, and recent birthdays with one-click wishes |
| **Special Announcements** | Post and celebrate life milestones (new car, home, baby, marriage, work anniversary) |
| **Achievements** | Company-wide wall of fame |
| **Recognition** | Peer-to-peer shout-outs with a Give Recognition dialog |
| **Ideas Corner** | Submit ideas with aligned like/unlike voting buttons (one vote per user, tracked in Firestore) |
| **Events** | Create events and RSVP with real-time attendee count |
| **News & Events** | Company announcements with featured images |
| **Feedback** | Submit suggestions, bug reports, or praise — anonymously or named |
| **Developer Tools** | JSON Viewer, HTML Viewer, Base64 Tool, Timestamp Converter, AMP Validator, API Collection, Color Converter, CSS Gradient Generator, CSS Minifier, Hash Generator, HTML Formatter, JWT Decoder, Markdown Preview, PageSpeed Insights, Password Generator, Purge URL, Schema Checker, Text Diff, URL Encoder, UUID Generator |
| **Profile** | User profile with achievements, stats, and a circular progress ring showing profile completion percentage around the avatar |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Firebase Cloud Firestore |
| Auth | Firebase Authentication (Google) |
| Hosting | Firebase Hosting |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites

- Node.js 22+
- Firebase project with Firestore and Auth enabled

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google provider
3. Enable **Cloud Firestore** database
4. Update `src/firebase/config.ts` with your project credentials
5. Add your domain to **Authentication → Settings → Authorized Domains**

> First load auto-seeds Firestore with sample employees, achievements, ideas, events, and news if the database is empty.

---

## Deployment

### Manual

```bash
npm run build
npx firebase-tools@latest deploy --only hosting --project YOUR_PROJECT_ID
```

### CI/CD (GitHub Actions)

Every push to `main` automatically builds and deploys via `.github/workflows/deploy.yml`.

**Required GitHub secret:**

| Secret | Value |
|---|---|
| `SERVICE_KEY` | Firebase service account JSON (Firebase Console → Project Settings → Service Accounts) |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── employees/       # People directory with profile sheets
│   │   ├── achievements/    # Achievements wall
│   │   ├── news/            # News & events
│   │   ├── tools/           # Developer tools
│   │   ├── feedback/        # Feedback form
│   │   ├── profile/         # User profile & edit
│   │   └── layout.tsx       # App shell (sidebar, header, auth guard)
│   ├── login/               # Login page (Google Sign-In)
│   └── globals.css          # Design tokens & global styles
├── components/
│   ├── dashboard/           # Birthday, Announcements, Achievements, Recognition, Ideas, Events
│   ├── tools/               # Developer tool components
│   ├── ui/                  # shadcn/ui primitives
│   ├── app-nav.tsx          # Sidebar navigation
│   └── user-nav.tsx         # Header user dropdown with circular profile completion ring
├── firebase/                # Firebase init & React providers
├── hooks/
│   └── use-firestore-data.ts  # Real-time hooks for all Firestore collections
└── lib/
    ├── types.ts             # TypeScript types (Employee, Achievement, Idea, Event, Feedback…)
    └── data.ts              # Seed data
```

---

## Firestore Collections

| Collection | Description |
|---|---|
| `employees` | Employee records (auto-created on first Google Sign-In) |
| `achievements` | Achievement entries |
| `recognitions` | Peer recognition messages |
| `ideas` | Ideas with vote counts |
| `events` | Events with RSVP lists |
| `specialAnnouncements` | Life milestone posts |
| `news` | News articles |
| `feedback` | User-submitted feedback |
