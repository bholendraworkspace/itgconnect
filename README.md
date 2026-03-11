# ITG Connect - Internal Employee Hub

## Project Overview

ITG Connect is a modern, internal web application designed to be the central hub for employees at ITG. It aims to foster a more connected, engaged, and informed workplace by providing a suite of tools for social interaction, recognition, information sharing, and developer productivity. Built on a robust and scalable tech stack, ITG Connect is a one-stop-shop for employees to stay updated, celebrate successes, and interact with their colleagues.

---

## 1. Product Requirements (PRD)

### 1.1. Vision & Goal
To create a vibrant and centralized digital space that strengthens company culture, improves internal communication, and enhances employee engagement at ITG.

### 1.2. Target Audience
All employees of ITG, from new hires to senior leadership, across all departments.

### 1.3. Core Epics & Features

| Epic | Feature Description |
| --- | --- |
| **User & Profile Management** | - Secure user authentication via Google SSO. <br/> - Personalized user profiles displaying name, department, photo, and achievements. <br/> - Ability for users to edit their own profile information. |
| **Dashboard & Social Hub** | - A dynamic dashboard serving as the main landing page. <br/> - **Birthday Corner:** Display today's, upcoming, and recent birthdays. Allow users to send wishes. <br/> - **Special Announcements:** Showcase and congratulate colleagues on life events (e.g., work anniversaries, new home). |
| **Recognition & Achievements** | - **Achievements Feed:** A company-wide feed showcasing recent employee accomplishments. <br/> - **Recognition Corner:** Allow employees to give "shout-outs" or recognize their peers for their work. |
| **Engagement & Collaboration** | - **Ideas Corner:** A space for employees to submit innovative ideas. <br/> - Voting mechanism for colleagues to upvote ideas. <br/> - **Events Hub:** Announce company events (e.g., Townhalls, Meetups). <br/> - RSVP functionality for event management. |
| **Internal Communications** | - A dedicated "News & Events" section for official company announcements and articles. |
| **Developer Productivity** | - A "Developer Tools" section with essential utilities for technical staff. <br/> - AI-powered API Response Explainer. <br/> - Tools like JSON Viewer, HTML Viewer, Base64 Converter, and Timestamp Converter. |

---

## 2. Features

- **Secure Authentication:** Easy and secure login using Google accounts, powered by Firebase Authentication.
- **Dynamic Dashboard:** A central hub featuring:
    - **Birthday Corner:** Never miss a colleague's birthday again.
    - **Special Announcements:** Celebrate work anniversaries, new cars, new homes, and more.
    - **Achievements & Recognition:** See who's making an impact.
    - **Ideas Corner:** Submit and vote on the next big idea for the company.
    - **Event RSVP:** View and sign up for upcoming company events.
- **Company-Wide Feeds:**
    - **Achievements Page:** A dedicated view of all employee accomplishments.
    - **News & Events Page:** Stay informed with the latest company news and articles.
- **Personalized Profiles:**
    - View your profile with your details and a collection of your achievements.
    - Easily edit your personal information.
- **Developer Tools Suite:**
    - **AI API Explainer:** Paste a complex JSON response and get a simple, human-readable explanation powered by Genkit and Google's Gemini model.
    - **JSON & HTML Viewers:** Format and preview JSON or render HTML snippets.
    - **Base64 & Timestamp Converters:** Essential utilities for day-to-day development tasks.

---

## 3. Tech Stack & Architecture

### 3.1. Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (v15+) with App Router
- **UI:** [React](https://react.dev/) (v19+), [ShadCN/UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Firebase](https://firebase.google.com/)
    - **Authentication:** Firebase Authentication (Google Provider)
    - **Database:** Cloud Firestore
- **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) with Google AI (Gemini)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

### 3.2. Architecture

ITG Connect is built as a modern server-rendered application using the Next.js App Router.

-   **Frontend:** The UI is composed of reusable React components. We leverage Next.js Server Components for performance and SEO, and Client Components for interactivity. [ShadCN/UI](https://ui.shadcn.com/) provides the foundational, accessible component library, styled with [Tailwind CSS](https://tailwindcss.com/).
-   **Backend (BaaS):** [Firebase](https://firebase.google.com/) serves as the backend-as-a-service.
    -   **Firebase Authentication** handles user identity and session management.
    -   **Cloud Firestore** is the NoSQL database for storing all application data, such as user profiles, achievements, news posts, and events. Real-time data synchronization is achieved using Firestore's `onSnapshot` listeners.
-   **Styling:** Styling is managed via Tailwind CSS for utility-first design. A custom theme (colors, fonts, etc.) is defined in `src/app/globals.css` and `tailwind.config.ts`.
-   **State Management:** Component-level state is handled with React Hooks (`useState`, `useEffect`). For global Firebase state (like the current user), we use a custom React Context Provider (`src/firebase/provider.tsx`).
-   **Generative AI:** AI features are powered by [Genkit](https://firebase.google.com/docs/genkit). AI logic is encapsulated in "flows" located in `src/ai/flows/`. These flows are exposed as Next.js Server Actions, allowing secure and efficient communication between the client and the AI backend.
-   **Data Modeling:** The application's data structure is formally defined in `docs/backend.json` using JSON Schema, which serves as a blueprint for Firestore collections and security rules.

---

## 4. Project Structure

The project follows a standard Next.js App Router structure, with logical separation for different concerns.

```
itg-connect/
├── docs/
│   └── backend.json        # Data models and Firestore structure blueprint
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (app)/          # Authenticated routes (dashboard, profile, etc.)
│   │   ├── login/          # Login page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Root page (redirects to login)
│   ├── components/         # Reusable React components
│   │   ├── dashboard/      # Components specific to the dashboard
│   │   ├── tools/          # Components for the developer tools page
│   │   └── ui/             # ShadCN UI components
│   ├── lib/                # Shared utilities, types, and mock data
│   │   ├── data.ts         # Mock data for development
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # Utility functions (e.g., cn for classnames)
│   ├── firebase/           # Firebase integration files
│   │   ├── config.ts       # Firebase project configuration
│   │   ├── index.ts        # Firebase initialization and service exports
│   │   └── provider.tsx    # React Context provider for Firebase services
│   ├── ai/                 # Genkit AI integration files
│   │   ├── flows/          # Genkit flow definitions
│   │   └── genkit.ts       # Genkit global configuration
│   └── hooks/              # Custom React hooks
├── .env                    # Environment variables
├── apphosting.yaml         # Firebase App Hosting configuration
├── firestore.rules         # Firestore security rules
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

---

## 5. Setup and Installation

### 5.1. Prerequisites
- Node.js (v20 or later)
- npm or yarn

### 5.2. Local Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd itg-connect
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - In your project, go to **Project Settings** > **General**.
    - Under "Your apps", create a new Web App.
    - Copy the `firebaseConfig` object.
    - Paste this object into `src/firebase/config.ts`.
    - Go to the **Authentication** section, click "Get Started", and enable the **Google** sign-in provider.
    - Go to the **Firestore Database** section, click "Create database", start in **production mode**, and choose a location.

4.  **Set up Environment Variables:**
    - Edit the `.env` file in the root of the project.
    - If you are using AI features, add your Gemini API key to this file.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### 5.3. Environment Variables

-   The Firebase configuration in `src/firebase/config.ts` is used for local development. When deployed to Firebase App Hosting, the configuration is provided automatically.
-   For AI features, you need to add your Gemini API key to the `.env` file.

```env
# .env

# Add your Gemini API key for Genkit AI features
# This is required for the "AI API Explainer" tool to function.
# Get your key from Google AI Studio: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 6. Development Workflow

-   **Branching:** Create a new branch from `main` for each new feature or bugfix (e.g., `feature/add-polling` or `fix/login-bug`).
-   **Committing:** Use clear and descriptive commit messages.
-   **Linting & Formatting:** The project is set up with ESLint. Ensure your code adheres to the project's standards. Run `npm run lint` to check for issues.
-   **Type Checking:** Run `npm run typecheck` to ensure there are no TypeScript errors.
-   **Pull Requests (PRs):** Once your feature is complete, open a Pull Request against the `main` branch. Provide a clear description of the changes and link any relevant issues.

---

## 7. Contribution Guidelines

We welcome contributions! Please follow these steps to contribute:

1.  **Fork the repository.**
2.  **Create a feature branch** on your fork (`git checkout -b my-new-feature`).
3.  **Commit your changes** (`git commit -am 'Add some feature'`).
4.  **Push to the branch** (`git push origin my-new-feature`).
5.  **Create a new Pull Request.**
