# Onboarding Guide

## Project Summary

Project Lung helps dispatchers manage EV bus operations.

## First Steps

1. Clone repository
2. Install dependencies

```bash
npm install
```

3. Create `.env.local`

```env
DATABASE_URL=""
```

4. Set up database

Note on database commands:

- `npm run db:migrate` applies existing migrations to the database.
- `npm run db:generate` is for developers generating new migration files after modifying the Drizzle schema.
- `npm run db:seed` is optional and should only be run against a confirmed safe non-production database.

```bash
npm run db:migrate
# optional: npm run db:seed
```

5. Start app

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
