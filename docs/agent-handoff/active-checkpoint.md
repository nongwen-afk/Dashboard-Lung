# Active Agent Handoff Checkpoint

- **Current active issue:** None (Ready for Next Task)
- **Current phase:** Awaiting next issue assessment
- **Current branch:** dev
- **Base branch:** dev
- **Repo:** nongwen-afk/Dashboard-Lung

## Next Candidate Work:

- Epic #8 Database Design work items (Assessment required before implementation).

## Which files to read next:

- [docs/agent-handoff/issues/issue-29-better-auth.md](file:///Users/microwen/Desktop/project-lung/dashboard-lung/docs/agent-handoff/issues/issue-29-better-auth.md)
- [docs/agent-handoff/prompts/codex-github-cleanup.md](file:///Users/microwen/Desktop/project-lung/dashboard-lung/docs/agent-handoff/prompts/codex-github-cleanup.md)

## Agent role split:

- **Antigravity:** local code, verification, commit/push only when user approves
- **Codex:** GitHub UI / Issue / Project Board cleanup only after user confirms PR/merge status

## Hard constraints:

- Antigravity must not modify GitHub Issues/Project Board
- Codex must not modify code unless explicitly approved
- The project uses **npm** only. Do not use pnpm.

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
