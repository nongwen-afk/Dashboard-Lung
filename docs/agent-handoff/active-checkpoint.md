# Active Agent Handoff Checkpoint

- **Current active issue:** #18 Create Route Schema
- **Current phase:** local implementation completed, awaiting user review
- **Current branch:** feature/issue-18-route-schema
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
