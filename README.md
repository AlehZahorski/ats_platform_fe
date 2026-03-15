# ATS Platform — Frontend

Production-ready Next.js frontend for a multi-tenant SaaS Applicant Tracking System (ATS).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI primitives |
| State management | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Drag & Drop | dnd-kit |
| Internationalization | next-intl |
| Notifications | Sonner |
| Icons | Lucide React |
| Theme | next-themes (dark/light mode) |

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/             # Login page
│   │   └── signup/            # Signup page
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx       # Dashboard home
│   │       ├── jobs/          # Jobs list + job detail
│   │       ├── applications/  # Applications list + detail
│   │       ├── pipeline/      # Kanban pipeline board
│   │       ├── forms/         # Form template builder
│   │       └── settings/      # Workspace settings
│   ├── (public)/
│   │   ├── apply/[jobId]/     # Public candidate application page
│   │   └── track/[token]/     # Public application tracking page
│   └── layout.tsx             # Root layout
├── components/
│   └── layout/
│       ├── Sidebar.tsx        # Dashboard sidebar navigation
│       ├── Topbar.tsx         # Dashboard topbar + theme toggle
│       ├── Providers.tsx      # React Query + theme providers
│       └── ThemeProvider.tsx  # next-themes wrapper
├── services/
│   ├── api/                   # Axios API client + per-module services
│   │   ├── client.ts          # Axios instance + token refresh interceptor
│   │   ├── auth.ts
│   │   ├── jobs.ts
│   │   ├── applications.ts
│   │   ├── pipeline.ts
│   │   ├── tags.ts
│   │   └── forms.ts
│   └── queries/               # React Query hooks
│       ├── auth.queries.ts
│       ├── jobs.queries.ts
│       ├── applications.queries.ts
│       └── pipeline.queries.ts
├── types/
│   └── index.ts               # TypeScript interfaces
├── lib/
│   └── utils.ts               # cn(), formatDate(), getInitials()
├── i18n/
│   ├── en.json                # English translations
│   ├── pl.json                # Polish translations
│   └── request.ts             # next-intl server config
├── styles/
│   └── globals.css            # Tailwind + CSS variables (dark/light theme)
├── .env.example               # Environment variable template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Backend API running at `http://localhost:8000`

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

`.env.local` contents:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Start the development server

```bash
npm run dev
```

App available at: **http://localhost:3000**

---

## Application Areas

### HR Dashboard (`/dashboard`)

Accessible only to authenticated users.

| Route | Description |
|---|---|
| `/dashboard` | Overview with stats and recent jobs |
| `/dashboard/jobs` | Job postings list, create, edit, delete |
| `/dashboard/jobs/[jobId]` | Job detail with applications list |
| `/dashboard/applications` | All applications with search and filter |
| `/dashboard/applications/[id]` | Candidate profile with notes, scores, timeline |
| `/dashboard/pipeline` | Kanban board — drag candidates between stages |
| `/dashboard/forms` | Form template builder |
| `/dashboard/settings` | Workspace settings |

### Candidate Application Portal (`/apply`)

Public page — no login required.

| Route | Description |
|---|---|
| `/apply/[jobId]` | Dynamic application form with CV upload |

### Candidate Tracking Portal (`/track`)

Public page — no login required.

| Route | Description |
|---|---|
| `/track/[token]` | Application status timeline using public token |

---

## Authentication

Authentication uses **httpOnly cookies** set by the backend:

- `access_token` — 15 minute JWT, sent automatically with every request
- `refresh_token` — 30 day token, used to silently refresh the access token

The Axios client interceptor handles token refresh automatically. If refresh fails, the user is redirected to `/login`.

---

## Design System

The app uses a custom design system built on Tailwind CSS with CSS variables for theming.

**Color palette:**
- Background: Dark slate (`hsl(220 20% 8%)`)
- Accent: Amber/gold (`hsl(43 96% 56%)`)
- Sidebar: Deep dark (`hsl(220 22% 7%)`)

**Typography:**
- UI font: `DM Sans`
- Display/headings: `Playfair Display`

**Dark mode** is enabled by default and can be toggled via the topbar button. Preference is persisted automatically.

---

## Internationalization

Supported languages: **English** and **Polish**

Translation files are located in `i18n/en.json` and `i18n/pl.json`.

The active locale is stored in a `locale` cookie. To add a new language:

1. Add a new JSON file in `i18n/` (e.g. `de.json`)
2. Add the locale to `i18n/routing.ts`
3. Translate all keys from `en.json`

---

## API Integration

All API calls go through the Axios client in `services/api/client.ts`.

**Base URL:** `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`)

**Credentials:** `withCredentials: true` — cookies are sent automatically with every request.

React Query handles caching, loading states, and background refetching. All query keys are centralized in `services/queries/`.

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# TypeScript type check
npm run type-check
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## License

MIT