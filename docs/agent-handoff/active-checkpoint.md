# Active Agent Handoff Checkpoint

- **Current active issue:** None
- **Current phase:** Awaiting next planning / release decision
- **Current branch:** dev
- **Base branch:** dev
- **Repo:** nongwen-afk/Dashboard-Lung

## Completed Maintenance Note: Release v0.2.0

- PR #90 release: v0.2.0 - Database & Mock Data Integration was merged into `main`.
- Main merge commit: `f325b6d220bf9e00a3a520b68b8b6a997a9ef06c`.
- `dev` branch remains active.
- Production Neon main schema migration was explicitly completed BEFORE merge.
- Production DB was NOT seeded with mock data.
- `db:seed` and `db:seed:mock` were completely forbidden and unexecuted.
- Better Auth remains paused.
- Mock Auth UI remains active.
- Epic #8 remains open and must not be closed without explicit user approval.
- The Vercel Production deployment correctly serves the latest database integration updates.

- Epic #76: Dev Database & Mock Data Integration (Done/Closed)
  - All child issues #77-#84 are Done/Closed.

## Completed Setup: Epic #76 (Dev Database & Mock Data Integration)

- Epic #76 was completely verified and closed (Project Status: Done).
- Neon is now the canonical database provider.
- Neon main = Production.
- Neon dev = Preview/local development.
- Vercel DATABASE_URL workflow is documented.
- Neon dev DB was migrated and seeded.
- Seeded Neon dev data: 3 routes, 15 vehicles, 17 drivers, 207 assignments for 2026-07-01.
- Dashboard, Drivers, and Analytics use DB-backed fleet data where in scope.
- Charts, timetables, utilization stats, GPS/map animation, and performance metrics remain mock/UI-only.
- Better Auth remains paused.
- Mock Auth UI remains active.
- Production DB was not touched.

## Completed Setup: Issue #84 (Document Dev Database and Mock Data Workflow)

- Issue #84 Document Dev Database and Mock Data Workflow is Done/Closed.
- PR #89 merged into `dev`.
- Branch `feature/issue-84-document-db-workflow` was deleted remotely.
- Neon is now documented as canonical database provider.
- Neon main = Production.
- Neon dev = Preview/local development.
- Vercel DATABASE_URL setup documented:
  - Production = Neon main
  - Preview = Neon dev for all preview branches
- Local `.env.local` should use Neon dev.
- `db:migrate` safety workflow documented.
- `db:seed:mock` safety workflow documented.
- Fixed demo date 2026-07-01 documented.
- Seeded Neon dev data documented: 3 routes, 15 vehicles, 17 drivers, 207 assignments.
- UI-only mock data documented.
- Better Auth remains paused.
- Mock Auth UI remains active.
- No application, package, schema, or migration files were modified.
- `db:migrate`, `db:seed`, and `db:seed:mock` were NOT run.
- Production DB was NOT touched.
- Epic #76 remains Open / In progress for now.
- Epic #8 remains open and must not be closed without explicit user approval.
- Next active candidate is Epic #76 closure review, not a new implementation issue.

## Completed Setup: Issue #83 (Connect Drivers and Analytics UI to Database Data)

- Issue #83 Connect Drivers and Analytics UI to Database Data is Done/Closed.
- PR #88 merged into `dev`.
- Branch `feature/issue-83-drivers-analytics-db-data` was deleted remotely.
- Dashboard, Drivers, and Analytics pages now share a common `useHydrateFleet` DB hydration hook.
- Drivers page (`DriverDashboard`) uses DB-backed fleet data.
- Analytics page (`AnalyticsDashboard`) uses DB-backed routes for its table.
- Analytics charts, timetables, utilization stats, and GPS maps remain mock/UI-only.
- Fixed demo date "2026-07-01" is intentionally used.
- Fixed duplicate route key bug (Thai DB names map correctly to stable UI IDs `L1`, `L2`, `L3` with fail-fast validation).
- Schema/migration files were NOT modified.
- `db:migrate`, `db:seed`, and `db:seed:mock` were NOT run.
- Production DB was NOT touched.
- Better Auth remains paused.
- Mock auth UI remains.
- Epic #76 remains In progress.
- Epic #8 remains open and must not be closed without explicit user approval.
- Next active candidate is #84 Document Dev Database and Mock Data Workflow.

## Completed Setup: Issue #82 (Connect Dashboard UI to Database Data)

- Issue #82 Connect Dashboard UI to Database Data is Done/Closed.
- PR #87 merged into `dev`.
- Branch `feature/issue-82-dashboard-db-data` was deleted remotely.
- Dashboard UI now hydrates from database-backed server actions.
- Added `lib/data-mapper.ts` to map DB rows to the existing Dashboard UI/store shape.
- `fleetStore` updated to support `hydrateFleetData`, `isLoading`, and `error` states.
- Fixed demo date "2026-07-01" is intentionally used.
- Drivers and Analytics pages intentionally deferred to #83.
- Schema/migration files were NOT modified.
- `db:migrate`, `db:seed`, and `db:seed:mock` were NOT run.
- Production DB was NOT touched.
- Better Auth remains paused.
- Mock auth UI remains.
- Epic #76 remains In progress.
- Epic #8 remains open and must not be closed without explicit user approval.
- Next active candidate is #83 Connect Drivers and Analytics UI to Database Data.

## Completed Setup: Issue #81 (Server Actions for Fleet Master Data)

- Issue #81 Implement Server Actions for Fleet Master Data is Done/Closed.
- PR #86 merged into `dev`.
- Branch `feature/issue-81-fleet-server-actions` was deleted remotely.
- Created `src/services/fleet.ts` with Drizzle DB queries (using manual SQL joins).
- Created `src/actions/fleet.ts` with `use server` wrappers for frontend consumption.
- Exposed routes, vehicles, drivers, and date-filtered assignments.
- UI intentionally NOT connected yet.
- Schema/migration files were NOT modified.
- `db:migrate`, `db:seed`, and `db:seed:mock` were NOT run.
- Production DB was NOT touched.
- Better Auth remains paused.
- Mock auth UI remains.
- Epic #76 remains In progress.
- Epic #8 remains open and must not be closed without explicit user approval.

## Completed Setup: Issue #80 (Seed Dev Database)

- Issue #80 Seed Dev Database with MVP Demo Data is Done/Closed.
- Neon Dev DB was seeded successfully with mock data.
- Exact seed counts: 3 routes, 15 vehicles, 17 drivers, 207 assignments (Date: 2026-07-01).
- `db:seed:mock` was run ONLY on the Neon Dev database.
- `db:migrate` and `db:seed` were intentionally NOT run during this step.
- Production DB was NOT touched.
- No files were modified during the seed execution.
- No secrets were printed.
- Better Auth remains paused.
- Mock auth UI remains.
- Epic #76 remains In progress.
- Epic #8 remains open and must not be closed without explicit user approval.

## Completed Setup: Issue #79 (Mock Data DB Seed Script)

- Issue #79 Create Full Mock Data DB Seed Script is Done/Closed.
- PR #85 merged into `dev`.
- Branch `feature/issue-79-mock-seed-script` was deleted.
- Added `src/db/seed-mock.ts` script for full mock data seeding.
- Added `db:seed:mock` to npm scripts.
- `db:seed` and `db:seed:mock` were intentionally NOT run yet.
- Neon dev database is migrated but has no seed data yet.
- Production DB was not touched.
- Better Auth remains paused.
- Mock auth UI remains.
- Epic #76 remains In progress.
- Epic #8 remains open and must not be closed without explicit user approval.

## Completed Setup: Dev Database Migration

- Dev DB (dashboard-lung-dev) created and migrated.
- Production/Preview `DATABASE_URL` separated.
- Vercel Preview for branch `dev` uses Dev DB.
- Local `.env.local` uses Dev DB.
- Migrations 0000-0008 applied successfully to Dev DB (`npm run db:migrate`).
- `db:seed` was not run.
- Production DB was not touched.
- Better Auth remains paused.
- Epic #8 remains open unless user explicitly approves closing.

## Completed Setup: Vercel Deployment

- Vercel project created: `dashboard-lung`.
- Production URL: https://dashboard-lung.vercel.app
- Production branch: `main` (latest commit `9c77d82`).
- `dev` and feature branches should be used for preview deployments.
- Build command: `npm run build`.
- Install command: `npm install` (Vercel default).
- Required environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`) are configured securely in Vercel.
- `db:migrate` and `db:seed` are NOT run as part of the Vercel build.
- Epic #8 remains open unless user explicitly approves closing.

## Completed Maintenance Note: UI Port from pleum

- Codex cleanup for UI port is complete.
- UI Epic #68 is Done/Closed.
- Child issues #70-#74 are Done/Closed.
- PR #69 was already merged into dev.
- feature/port-pleum-ui remote branch was deleted.
- local feature/port-pleum-ui was deleted.
- UI from pleum was manually ported safely.
- Epic #8 remains open and must not be closed without explicit user approval.
- dev should not be merged to main yet unless user explicitly approves release.

## Which files to read next:

- [docs/agent-handoff/issues/issue-29-better-auth.md](file:///Users/microwen/Desktop/Projects_lung/dashboard-lung/docs/agent-handoff/issues/issue-29-better-auth.md)
- [docs/agent-handoff/prompts/codex-github-cleanup.md](file:///Users/microwen/Desktop/Projects_lung/dashboard-lung/docs/agent-handoff/prompts/codex-github-cleanup.md)
- [docs/agent-handoff/codex-backlog.md](file:///Users/microwen/Desktop/Projects_lung/dashboard-lung/docs/agent-handoff/codex-backlog.md)

## Agent role split / Current State:

- Codex may be unavailable due to usage limits.
- Antigravity will continue code implementation work.
- Antigravity cannot reliably update GitHub Issues / Project Board in the current environment.
- Codex must later read `docs/agent-handoff/codex-backlog.md` and perform GitHub cleanup retroactively.

## Hard constraints:

- Antigravity must not modify GitHub Issues/Project Board
- Codex must not modify code unless explicitly approved
- The project uses **npm** only. Do not use pnpm.
- Epic #8 Database Design is complete at 12/12, 100%, but must remain open until explicit user approval.
- Do not merge dev into main yet.
- MUST NOT use the retired broken repository (/Users/microwen/Desktop/project-lung/dashboard-lung). Only use the canonical path (/Users/microwen/Desktop/Projects_lung/dashboard-lung).

## Completed Maintenance Note: Issue #32 (Create Database Indexes)

- Issue #32 (Create Database Indexes) was completed and closed (Project Status: Done).
- PR #67 was merged into `dev`.
- Branch `feature/issue-32-database-indexes` was deleted.
- Database indexes and unique constraints were added for MVP.
- `assignments` received `assignment_date_idx`.
- `assignments` received exact same-time unique constraints for vehicle/date/time and driver/date/time.
- `events` received lookup indexes for assignment, vehicle, and driver.
- `recommendations` received lookup indexes for assignment and status.
- Overlapping time/range constraints were intentionally deferred.
- No `btree_gist` or exclusion constraints were added.
- `npm run db:migrate` was intentionally not run.
- `npm run db:seed` was intentionally not run.
- Epic #8 Database Design now appears complete at 12/12, 100%.
- Epic #8 must remain open for now.
- Epic #8 requires explicit user approval before closing.

## Completed Maintenance Note: Issue #31 (Create Database Migration)

- Issue #31 (Create Database Migration) was completed and closed (Project Status: Done).
- PR #66 was merged into `dev`.
- Branch `feature/issue-31-database-migration` was deleted.
- Existing Drizzle migration chain (0000-0007) was verified.
- No new migration file was created because the schema was fully covered.
- No schema files or migration files were modified.
- README and onboarding docs were updated to clarify migration setup flow.
- Docs now clarify:
  - `npm run db:migrate` applies existing migrations to a database (used for setup).
  - `npm run db:generate` is for developers after changing Drizzle schema files.
  - `npm run db:seed` is optional and only for confirmed safe non-production databases.
- `npm run db:migrate` and `npm run db:seed` were intentionally not run during implementation.

## Completed Maintenance Note: Issue #30 (Seed Data)

- Issue #30 (Create Seed Data) was completed and closed (Project Status: Done).
- PR #65 was merged into `dev`.
- Branch `feature/issue-30-seed-data` was deleted.
- Initial development seed data was added.
- Seed script added at `src/db/seed.ts`.
- `db:seed` npm script added.
- `tsx` added as a devDependency.
- Seed data includes 3 routes, 3 vehicles, 3 drivers, and sample assignments.
- Seed data uses fixed UUIDs.
- Seed inserts use `onConflictDoNothing()`.
- Production guard prevents running when `NODE_ENV` is `production`.
- The script does not delete, truncate, reset, or overwrite existing data.
- Better Auth `user` and `user_profiles` are intentionally not seeded.
- Events and recommendations are intentionally not seeded.
- `npm run db:seed` was intentionally not run during implementation because `DATABASE_URL` could not be confirmed safe and non-production.

## Completed Maintenance Note: Issue #27 (Recommendation Schema)

- Issue #27 (Create Recommendation Schema) was completed and closed (Project Status: Done).
- PR #64 was merged into `dev`.
- Branch `feature/issue-27-recommendation-schema` was deleted.
- Recommendation schema added for storing algorithm output and dispatcher decisions.
- `recommendations` table includes `uuid` id, `assignment_id`, `event_id`, `recommendation_type` enum, `reason`, `confidence`, `metadata` jsonb, `algorithm_version`, `recommendation_status` enum, `created_at`, `resolved_at`, `resolved_by`.
- `recommendation_type` values are `replace_driver`, `replace_vehicle`, `change_route`, `assign_reserve_driver`, `other`.
- `recommendation_status` values are `pending`, `accepted`, `rejected`, `expired`.
- `assignment_id` is required.
- `event_id` is nullable.
- `confidence` is nullable decimal precision 3 scale 2.
- `metadata` is nullable jsonb for flexible algorithm-team output.
- `algorithm_version` is nullable text.
- `resolved_by` references Better Auth `user.id`.
- no algorithm logic was implemented.
- `created_by` and `updated_at` were intentionally not added.
- suggested/replacement driver, vehicle, and route FK fields were intentionally postponed until the algorithm contract is finalized.
- indexes and constraints were deferred to Issue #32.

## Completed Maintenance Note: Issue #22 (Event Schema)

- Issue #22 (Create Event Schema) was completed and closed (Project Status: Done).
- PR #63 was merged into `dev`.
- Branch `feature/issue-22-event-schema` was deleted.
- Event schema added as append-only operational logs.
- `events` table includes `uuid` id, `event_type` enum, `description`, `assignment_id`, `vehicle_id`, `driver_id`, `route_id`, `created_by`, `created_at`.
- `event_type` values are `driver_leave`, `driver_absent`, `vehicle_breakdown`, `maintenance`, `driver_swap`, `vehicle_swap`, `manual_override`, `recommendation_applied`, `other`.
- `created_by` references Better Auth `user.id` directly.
- foreign keys are nullable.
- `updated_at` was intentionally not added.
- reverse relations and placeholder relations were not added.
- indexes and constraints were deferred to Issue #32.

## Completed Maintenance Note: Issue #21 (Assignment Schema)

- Issue #21 (Create Assignment Schema) was completed and closed (Project Status: Done).
- PR #62 was merged into `dev`.
- Branch `feature/issue-21-assignment-schema` was deleted.
- Assignment schema added as daily dispatch operation records.
- `assignments` table links vehicles, drivers, and routes.
- `assignments` table includes `uuid` id, `assignment_date`, `departure_time`, `vehicle_id`, `driver_id`, `route_id`, `assignment_status` enum, `note`, `created_at`, `updated_at`.
- `assignment_status` values are `pending`, `in_progress`, `completed`, `cancelled`.
- `status` defaults to `pending`.
- `driver_id` is required / not nullable.
- Composite unique constraints and additional indexes were deferred to Issue #32.
- No reverse relations or placeholder relations were added.

## Completed Maintenance Note: Issue #20 (Driver Schema)

- Issue #20 (Create Driver Schema) was completed and closed (Project Status: Done).
- PR #61 was merged into `dev`.
- Branch `feature/issue-20-driver-schema` was deleted.
- Driver schema added as master data for dispatch MVP.
- `drivers` table includes `uuid` id, unique `employee_code`, `full_name`, `phone`, `driver_type` enum, `driver_status` enum, `created_at`, `updated_at`.
- `driver_type` values are `primary`, `reserve`.
- `driver_type` has no default and must be explicitly selected.
- `driver_status` values are `active`, `leave`, `absent`, `inactive`.
- `status` defaults to `active`.
- No `user_id` or `vehicle_id` was added.
- No placeholder relations were added.

## Completed Maintenance Note: Issue #19 (Vehicle Schema)

- Issue #19 (Create Vehicle Schema) was completed and closed (Project Status: Done).
- PR #60 was merged into `dev`.
- Branch `feature/issue-19-vehicle-schema` was deleted.
- Vehicle schema added as master data for dispatch MVP.
- `vehicles` table includes `uuid` id, unique `vehicle_code`, unique `license_plate`, required `capacity`, `vehicle_status` enum, `created_at`, `updated_at`.
- `vehicle_status` values are `available`, `running`, `maintenance`, `breakdown`, `inactive`.
- No `route_id` or `primary_driver_id` was added.
- No placeholder relations were added.

## Completed Maintenance Note: Issue #18 (Route Schema)

- Issue #18 (Create Route Schema) was completed and closed (Project Status: Done).
- PR #59 was merged into `dev`.
- Branch `feature/issue-18-route-schema` was deleted.
- Route schema added as MVP route master data.
- `routes` table includes: `uuid` id, `name`, nullable `origin`/`destination`, `is_active`, `created_at`, `updated_at`.
- No placeholder relations were added.
- Issue #21 was not touched.

## Completed Maintenance Note: Issue #17 (User Profiles)

- Issue #17 (Create User Profiles Schema) was completed and closed (Project Status: Done).
- PR #58 was merged into `dev`.
- Branch `feature/issue-17-user-profiles` was deleted.
- Duplicate PR #57 was closed unmerged and should not be touched.

## Completed Maintenance Note: PR #41 & Main/Dev Sync

- PR #41 was closed as stale/superseded.
- PR #41 was not merged.
- main/dev divergence was cleaned by merging origin/main into dev using strategy `ours`.
- Merge commit: f7609bc06b8e117a751192e2fcd34d771417115a
- This preserved the dev file tree exactly.
- Verification passed:
  - npm run build
  - npm run typecheck
  - npm run format:check
  - npm run lint
  - git diff --check
- dev was pushed to origin successfully.
- Future release PRs should be created fresh from dev into main with a release title, for example: `release: v0.1.0 - Initial Project Setup`
- Old PR #41 should not be reopened.
- Do not use PR #41 for release.
- Future release should use a new clean PR.
