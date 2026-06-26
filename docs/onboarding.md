# Onboarding Guide

## Project Summary

Project Lung helps dispatchers manage EV bus operations.

## First Steps

1. Clone repository
2. Install dependencies

```bash
pnpm install
```

3. Create `.env.local`

```env
DATABASE_URL=""
```

4. Start app

```bash
pnpm dev
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
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```
