# 🚌 Fleet Management Dashboard

**ระบบจัดการรถโดยสารและการแทนที่พนักงานขับรถ** — Decision Support System for EV Bus Dispatch Operations.

---

## Tech Stack

| Package              | Version         | ใช้ทำอะไร                   |
| -------------------- | --------------- | --------------------------- |
| Next.js              | 16 (App Router) | Framework                   |
| React                | 19              | UI Library                  |
| TypeScript           | 5               | Type safety                 |
| Tailwind CSS         | 4               | Styling                     |
| shadcn/ui & Radix UI | latest          | Accessible UI components    |
| Zustand              | 5               | Global state                |
| Recharts             | 3               | Charts/Graphs               |
| Lucide React         | latest          | Icons                       |
| Neon PostgreSQL      | latest          | Primary database            |
| Drizzle ORM          | latest          | Schema, migrations, queries |
| Better Auth          | paused          | Authentication              |
| npm                  | latest          | Package manager             |

---

## Features

### Dashboard

- Full-screen layout (Sidebar + Map + Right Panel)
- Real-time clock and live status badges

### Route Overview

- 3 เส้นทาง (Red / Blue / Green Line)
- Bus Cards พร้อม Driver Avatar
- Passenger Load Progress Bar พร้อม Color coding
- SVG mock city map พร้อม animated bus markers

### Reserve Pool

- แสดงคนสำรอง พร้อม Skill Stars, Availability Bar
- Click to select reserve driver ก่อน replace
- Real-time status update (Available → Assigned)

### Driver Assignment Table

- Filter by Route, Status
- Search by Driver Name
- Replace button → เปิด Modal
- "On Leave" state แสดงหลัง confirm

### Driver Replacement Modal

- Transfer visualization (Reserve → Driver)
- Reason dropdown (Sick Leave / Vacation / Emergency / Training)
- Date picker
- Notes textarea
- Confirm → Zustand state update → Toast notification

### Analytics & Simulation

- **Simulation UI**: Interactive testing environment
- **Charts & Timetables**: Fleet performance & utilization graphs
- **Drivers Page**: Comprehensive driver management list
- **Analytics Page**: Route & Fleet data aggregation

---

## Current Application State

**Database-Backed Features**:

- Dashboard fleet data
- Drivers page
- Analytics route/fleet data

**UI-Only Mock / Local-State Features**:

- Simulation UI
- Charts, timetables, and performance metrics (currently mock data)
- GPS/Map animation (currently mock visualization)

**Authentication**:

- Better Auth integration remains currently paused.
- A Mock Auth UI remains active as the gatekeeper.

---

## Getting Started

Install dependencies:

```bash
npm install
```

Set up database:

- **Important**: Neon `main` branch is Production. Neon `dev` branch is Preview/Local development.
- Your local `.env.local` must point to Neon `dev`. Vercel automatically splits Production and Preview environments.
- `npm run db:migrate` applies existing schema to the database.
- `npm run db:generate` creates new migration files (use this only after changing schema files).
- `npm run db:seed:mock` generates deterministic demo mock data (fixed date: 2026-07-01). **This must NEVER be run on Production.**

```bash
npm run db:migrate
# Optional (dev only): npm run db:seed:mock
```

Start development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

---

## Code Quality

Run quality checks before creating a pull request. All team members should run these commands before submitting code:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run db:generate
npm run test:e2e
git diff --check
```

Format code automatically:

```bash
npm run format
```

---

## Project Structure

```text
/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI and layout components
├── lib/                  # Utility functions and store state
├── hooks/                # Custom React hooks
├── src/db/               # Database connection and config
├── src/actions/          # Server Actions
├── src/services/         # Backend services and data fetching
├── docs/                 # Documentation
├── tests/                # Playwright end-to-end tests
└── drizzle/              # Drizzle ORM migration files
```

For full details on the workflow, environment setups, and project constraints, please read:

- `docs/onboarding.md`
- `docs/deployment.md`
- `docs/project-bible.md`
