# ITG Connect

A modern internal employee hub built with Next.js, Firebase, and Tailwind CSS. Designed to help ITG employees connect, celebrate achievements, share ideas, and stay informed — all in one beautifully designed platform.

## Live Demo

**[https://studio-1240945126-b5f6c.web.app](https://studio-1240945126-b5f6c.web.app)**

## Features

- **Authentication** — Google Sign-In and Guest login via Firebase Auth
- **Dashboard** — Personalized greeting, birthday corner, special announcements, achievements, recognition, ideas, and events
- **Firestore Database** — All data (ideas, events, recognitions, announcements) stored and synced in real-time via Cloud Firestore
- **Birthday Corner** — Shows today's, upcoming, and recent birthdays with one-click wishes
- **Special Announcements** — Post and celebrate life milestones (new car, home, baby, marriage, work anniversary)
- **Achievements** — Company-wide wall of fame
- **Recognition** — Peer-to-peer shout-outs with a Give Recognition dialog
- **Ideas Corner** — Submit ideas and vote (one vote per user, tracked in Firestore)
- **Events** — Create events and RSVP with real-time attendee count
- **News & Events** — Company announcements with featured images
- **Developer Tools** — JSON Viewer, HTML Viewer, Base64 Encoder, Timestamp Converter
- **Profile** — User profile with achievements and stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS + ShadCN UI |
| Database | Firebase Cloud Firestore |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |
| AI | Genkit + Google Gemini (dev only) |

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore and Auth enabled

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google provider
3. Enable **Cloud Firestore** database
4. Update `src/firebase/config.ts` with your project credentials
5. Add your domain to **Authentication → Settings → Authorized Domains**

### Firestore Security Rules (recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment

```bash
# Build static export
npm run build

# Deploy to Firebase Hosting
npx firebase-tools@latest deploy --only hosting --project YOUR_PROJECT_ID
```

## Project Structure

```
src/
├── app/
│   ├── (app)/           # Protected routes (dashboard, achievements, news, tools, profile)
│   ├── login/           # Login page
│   └── globals.css      # Global styles & design tokens
├── components/
│   ├── dashboard/       # Birthday, Announcements, Achievements, Recognition, Ideas, Events
│   ├── tools/           # Developer tool components
│   └── ui/              # ShadCN UI components
├── firebase/            # Firebase initialization & providers
├── hooks/
│   └── use-firestore-data.ts  # Real-time Firestore hooks for all collections
└── lib/
    ├── types.ts         # TypeScript types
    └── data.ts          # Seed data (auto-seeded to Firestore on first load)
```

## Important Notes

- **First Load**: On the first visit, the app automatically seeds Firestore with sample data if the database is empty.
- **Guest Users**: Anonymous sign-in is supported. Guest users can browse and interact but their UID is `anonymous`.
- **AI Feature**: The Genkit AI API Explainer requires a server environment and is only available in development mode.
