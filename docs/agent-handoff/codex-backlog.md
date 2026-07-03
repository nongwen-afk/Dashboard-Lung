# Codex GitHub Project Backlog

## Purpose

This file tracks all GitHub Issue / Project Board work that Codex needs to do later after Antigravity completes code work. Since Codex may be unavailable due to usage limits, Antigravity will continue code implementation work but cannot reliably update GitHub in the current environment. Codex will later read this document and perform GitHub Project cleanup retroactively.

## Rules for Antigravity

- Continue code work only when approved by the user.
- Do not assume GitHub Project cleanup is done.
- After each completed code task, add a backlog entry for Codex if GitHub cleanup is needed.
- Record branch name, PR number if known, merge status, deleted branch status, verification results, and exact cleanup needed.
- Do not mark GitHub issues Done in documentation unless the work was merged into dev and verified.
- Do not close Epic #8.
- Do not merge dev into main.
- Do not merge pleum directly.

## Rules for Codex

- Read this backlog before doing GitHub Project cleanup.
- Update GitHub Issues / Project Board only for entries listed here.
- Do not modify code.
- Do not create commits.
- Do not push.
- Do not merge branches.
- Do not delete branches unless explicitly instructed.
- Do not close Epic #8 unless user explicitly approves.
- Do not mark UI issues Done unless the work is merged into dev and verified.

## Current Pending GitHub Project Work

### Completed: Epic #76 (Dev Database & Mock Data Integration)

Code status:

- All child issues #77-#84 are completed and merged into `dev`.
- Verification: Passed (build, lint, typecheck, format, diff)

Codex GitHub Cleanup Completed:

- Epic checklist/body updated.
- Completion comment posted.
- Project Status: Moved to Done.
- Epic Closed: Yes.
- Child issues closed: 8 of 8 completed.
- Notes/constraints preserved: Epic #8 remains open. Production DB was strictly not touched.

### Completed: Issue #84 (Document Dev Database and Mock Data Workflow)

Code status:

- Branch: feature/issue-84-document-db-workflow
- PR: #89 docs(db): document neon dev mock data workflow
- Merged to dev: yes
- Feature branch deleted: yes (remote) / yes (local)
- Verification: Passed (build, lint, typecheck, format, diff)
- Files changed summary: Updated docs/onboarding.md, docs/deployment.md, docs/project-bible.md, and .env.example with Neon canonical status, dev/main branch strategies, safe Vercel DATABASE_URL handling, db:migrate/db:seed:mock safety boundaries, explicit dev seed dataset documentation, and mock data status.

Codex GitHub Cleanup Completed:

- Issue checklist/body updated: Noted the completion of all docs updates, explicitly stated safety boundaries, the 2026-07-01 fixed date, and safe `.env.example`.
- Completion comment posted: Summarized PR #89 and noted no DB commands were actually executed.
- Project Status: Moved to Done.
- Issue Closed: Yes.
- Parent/Epic updates: Epic #76 remains In progress, ready for closure review.
- Notes/constraints preserved: Better Auth remains paused. Mock Auth UI remains. Epic #8 remains open. Production DB was strictly not touched.

### Completed: Issue #83 (Connect Drivers and Analytics UI to Database Data)

Code status:

- Branch: feature/issue-83-drivers-analytics-db-data
- PR: #88 feat(data): connect drivers and analytics to fleet data
- Merged to dev: yes
- Feature branch deleted: yes (remote) / yes (local)
- Verification: Passed (build, lint, typecheck, format, diff)
- Files changed summary: Added hooks/useHydrateFleet.ts for shared DB hydration. Refactored DashboardView, DriverDashboard, and AnalyticsDashboard to use the shared hook. Updated data-mapper.ts with safe Thai route name mapping and fail-fast validation.

GitHub cleanup needed for Codex:

- Update issue checklist/body: Note shared hydration hook, DB-backed Drivers/Analytics, fixed demo date 2026-07-01, Thai route mapping fix, and safety notes.
- Post completion comment: Summarize PR #88 and safety notes.
- Move Project Status: Done
- Close issue: Yes
- Parent/Epic updates: Epic #76 remains In progress.
- Notes/constraints: Charts, timetables, utilization stats remain mock. No schema/migration files changed. No db:migrate/db:seed/db:seed:mock were run. Epic #8 remains open.

### Completed: Issue #82 (Connect Dashboard UI to Database Data)

Code status:

- Branch: feature/issue-82-dashboard-db-data
- PR: #87 feat(data): connect dashboard to fleet database data
- Merged to dev: yes
- Feature branch deleted: yes (remote) / yes (local)
- Verification: Passed (build, lint, typecheck, format, diff)
- Files changed summary: Added lib/data-mapper.ts. Modified fleetStore.ts to support hydration/loading/error state. Modified DashboardView.tsx to fetch db data concurrently via server actions on mount.

GitHub cleanup needed for Codex:

- Update issue checklist/body: Note DB-backed dashboard details, fixed demo date 2026-07-01, mapper/store hydration, and safety notes.
- Post completion comment: Summarize PR #87 and safety notes.
- Move Project Status: Done
- Close issue: Yes
- Parent/Epic updates: Epic #76 remains In progress.
- Notes/constraints: Drivers and Analytics pages intentionally deferred to #83. No schema/migration files changed. No db:migrate/db:seed/db:seed:mock were run. Epic #8 remains open.

### Completed: UI Port from pleum

Code status:

- Branch: feature/port-pleum-ui
- PR: #69 feat(ui): port dashboard foundation from pleum
- Merged to dev: yes
- Feature branch deleted: yes (both local and remote)
- Verification: Passed (build, lint, typecheck, format, diff)
- Files changed summary: UI components ported manually, safe Next 15 structure used, no schema or auth modification.

Codex GitHub Cleanup Completed:

- UI Epic #68 reused/updated and closed.
- Child issues created and closed:
  - #70 Resolve App Router Conflicts & Final UI Integration
  - #71 Setup UI Dependencies & Base Configurations
  - #72 Port Mock Data & State Management
  - #73 Port Main Dashboard UI
  - #74 Port Drivers & Analytics Pages
- Labels, Projects, and Completion comments updated on GitHub.
- Rule preserved: Epic #8 must not be closed without explicit user approval.

---

## Template for future entries

### <Issue title or task name>

Code status:

- Branch:
- PR:
- Merged to dev: yes/no/unknown
- Feature branch deleted: yes/no/unknown
- Verification:
- Files changed summary:

GitHub cleanup needed for Codex:

- Update issue checklist/body:
- Post completion comment:
- Move Project Status:
- Close issue:
- Parent/Epic updates:
- Notes/constraints:
