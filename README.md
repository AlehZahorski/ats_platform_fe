# TalentMatch - Frontend

Production-ready Next.js frontend for the TalentMatch Applicant Tracking System.

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
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ app/
Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ (auth)/
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ login/             # Login page
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ signup/            # Signup page
Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ (dashboard)/
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ dashboard/
Ă˘â€ťâ€š   Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ page.tsx       # Dashboard home
Ă˘â€ťâ€š   Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ jobs/          # Jobs list + job detail
Ă˘â€ťâ€š   Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ applications/  # Applications list + detail
Ă˘â€ťâ€š   Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ pipeline/      # Kanban pipeline board
Ă˘â€ťâ€š   Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ forms/         # Form template builder
Ă˘â€ťâ€š   Ă˘â€ťâ€š       Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ settings/      # Workspace settings
Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ (public)/
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ apply/[jobId]/     # Public candidate application page
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ track/[token]/     # Public application tracking page
Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ layout.tsx             # Root layout
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ components/
Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ layout/
Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ Sidebar.tsx        # Dashboard sidebar navigation
Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ Topbar.tsx         # Dashboard topbar + theme toggle
Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ Providers.tsx      # React Query + theme providers
Ă˘â€ťâ€š       Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ ThemeProvider.tsx  # next-themes wrapper
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ services/
Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ api/                   # Axios API client + per-module services
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ client.ts          # Axios instance + token refresh interceptor
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ auth.ts
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ jobs.ts
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ applications.ts
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ pipeline.ts
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ tags.ts
Ă˘â€ťâ€š   Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ forms.ts
Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ queries/               # React Query hooks
Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ auth.queries.ts
Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ jobs.queries.ts
Ă˘â€ťâ€š       Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ applications.queries.ts
Ă˘â€ťâ€š       Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ pipeline.queries.ts
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ types/
Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ index.ts               # TypeScript interfaces
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ lib/
Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ utils.ts               # cn(), formatDate(), getInitials()
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ i18n/
Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ en.json                # English translations
Ă˘â€ťâ€š   Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ pl.json                # Polish translations
Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ request.ts             # next-intl server config
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ styles/
Ă˘â€ťâ€š   Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ globals.css            # Tailwind + CSS variables (dark/light theme)
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ .env.example               # Environment variable template
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ next.config.mjs            # Next.js configuration
Ă˘â€ťĹ›Ă˘â€ťâ‚¬Ă˘â€ťâ‚¬ tailwind.config.ts         # Tailwind configuration
Ă˘â€ťâ€ťĂ˘â€ťâ‚¬Ă˘â€ťâ‚¬ tsconfig.json              # TypeScript configuration
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
| `/dashboard/pipeline` | Kanban board Ă˘â‚¬â€ť drag candidates between stages |
| `/dashboard/forms` | Form template builder |
| `/dashboard/settings` | Workspace settings |

### Candidate Application Portal (`/apply`)

Public page Ă˘â‚¬â€ť no login required.

| Route | Description |
|---|---|
| `/apply/[jobId]` | Dynamic application form with CV upload |

### Candidate Tracking Portal (`/track`)

Public page Ă˘â‚¬â€ť no login required.

| Route | Description |
|---|---|
| `/track/[token]` | Application status timeline using public token |

---

## Authentication

Authentication uses **httpOnly cookies** set by the backend:

- `access_token` Ă˘â‚¬â€ť 15 minute JWT, sent automatically with every request
- `refresh_token` Ă˘â‚¬â€ť 30 day token, used to silently refresh the access token

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

**Credentials:** `withCredentials: true` Ă˘â‚¬â€ť cookies are sent automatically with every request.

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
