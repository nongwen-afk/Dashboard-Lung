# Project Lung

Decision Support System for EV Bus Dispatch Operations.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Neon PostgreSQL
- Drizzle ORM
- Better Auth
- npm

## Architecture Decisions

- Use `npm` as the package manager
- Use Next.js Route Handlers and Server Actions for backend logic
- Use Neon PostgreSQL as the primary canonical database
- Use Drizzle ORM for schema, migrations, and type-safe queries
- Use Better Auth for authentication and role-based access control
- Use Role-Based Access Control (RBAC) for Admin and Dispatcher roles
- Use Vercel for deployment
- Use ESLint and Prettier for code quality

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

## Current Application State

**Database-Backed Features**:

- Dashboard UI
- Drivers Page
- Analytics Routes & Fleet Data

**UI-Only Mock Features**:

- Charts & Timetables
- Utilization Stats & Performance Metrics
- GPS/Map Animation

**Authentication**:

- Better Auth integration remains currently paused.
- A Mock Auth UI remains active as the gatekeeper.

For full details on the workflow, environment setups, and project constraints, please read:

- `docs/onboarding.md`
- `docs/deployment.md`
- `docs/project-bible.md`

Start development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

## Code Quality

Run quality checks before creating a pull request:

```bash
npm run lint
npm run typecheck
npm run build
npm run format:check
```

Format code automatically:

```bash
npm run format
```

All team members should run these commands before submitting code.

## Project Structure

```text
src/
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── services/
├── types/
├── constants/
└── utils/
```
