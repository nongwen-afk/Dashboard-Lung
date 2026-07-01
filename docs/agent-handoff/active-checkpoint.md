# Active Agent Handoff Checkpoint

- **Current active issue:** #29 Setup Better Auth
- **Current phase:** local implementation completed, awaiting user review / commit / push / PR / merge / GitHub Project cleanup
- **Current branch:** feature/setup-better-auth
- **Base branch:** dev
- **Repo:** nongwen-afk/Dashboard-Lung

## Which files to read next:

- [docs/agent-handoff/issues/issue-29-better-auth.md](file:///Users/microwen/Desktop/project-lung/dashboard-lung/docs/agent-handoff/issues/issue-29-better-auth.md)
- [docs/agent-handoff/prompts/codex-github-cleanup.md](file:///Users/microwen/Desktop/project-lung/dashboard-lung/docs/agent-handoff/prompts/codex-github-cleanup.md)

## Agent role split:

- **Antigravity:** local code, verification, commit/push only when user approves
- **Codex:** GitHub UI / Issue / Project Board cleanup only after user confirms PR/merge status

## Hard constraints:

- Antigravity must not modify GitHub Issues/Project Board
- Codex must not modify code unless explicitly approved
- Do not touch Issue #17 / user_profiles during Issue #29 cleanup

## Current State

- Local implementation completed.
- User review is still pending.
- Commit is not done.
- Push is not done.
- PR is not opened.
- PR is not merged.
- Feature branch is not deleted.
- GitHub Project cleanup is not done.

## Codex Instructions

- **Codex must not perform GitHub cleanup yet.**
- Codex cleanup is only allowed after the user explicitly confirms the PR/merge/branch-delete status.

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
