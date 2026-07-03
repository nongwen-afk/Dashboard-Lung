# Onboarding Guide

## Project Summary

Project Lung helps dispatchers manage EV bus operations.

## First Steps

1. Clone repository
2. Install dependencies (We use `npm` only, do not use `pnpm`)

```bash
npm install
```

3. Create `.env.local`

Your local environment file must use the Neon `dev` branch, never `main` (Production).
Retrieve the `DATABASE_URL` from the Neon dashboard (dev branch) or Vercel Preview Environment Variables.
Secrets must never be committed to the repository.

```env
# Neon dev branch connection string
DATABASE_URL="postgres://..."

# Local auth setup
BETTER_AUTH_SECRET="your_local_secret"
BETTER_AUTH_URL="http://localhost:3000"
```

4. Verify Setup

Run the full verification suite to ensure your environment is clean:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run db:generate
```

5. Set up database

Neon is our canonical database provider.

Note on database commands:

- `npm run db:generate`: For developers generating new migration files after modifying the Drizzle schema.
- `npm run db:migrate`: Applies existing migrations. Allowed **only** after confirming your `DATABASE_URL` points to the Neon `dev` branch.
- `npm run db:seed:mock`: Safely inserts required MVP demo data (routes, vehicles, drivers, and fixed 2026-07-01 assignments). Allowed **only** on the Neon `dev` branch. **Never run this on production.**

```bash
npm run db:migrate
npm run db:seed:mock
```

6. Start app

```bash
npm run dev
```

## Read First

- docs/project-bible.md
- docs/architecture.md
- docs/domain-model.md
- docs/business-rules.md
- docs/git-workflow.md

## Before PR

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```
