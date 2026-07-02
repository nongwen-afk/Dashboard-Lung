# Agent Operating Rules

## Repository Location

Canonical working directory:
/Users/microwen/Desktop/projects_lung/dashboard-lung

Retired broken repository:
/Users/microwen/Desktop/project-lung/dashboard-lung

Rules:
- Always use the canonical working directory.
- Never use the retired broken repository.
- Before doing work, run `pwd`, `git status`, and `git branch --show-current`.
- If `pwd` is not the canonical working directory, stop immediately.

## Branch Workflow

- `main` is the release branch.
- `dev` is the integration branch.
- Feature work should branch from `dev` unless the user says otherwise.
- Do not merge into `main` without explicit user approval.
- Do not delete `dev`.
- Do not delete branches unless explicitly approved.

## Package Manager

- Use npm only.
- Do not use pnpm.
- Do not recreate `pnpm-lock.yaml`.
- If dependency changes are needed, use npm and update package-lock.json.

## Database Safety

- Do not run `npm run db:migrate` unless explicitly approved after confirming DATABASE_URL is safe and non-production.
- Do not run `npm run db:seed` unless explicitly approved after confirming DATABASE_URL is safe and non-production.
- `npm run db:generate` is safe for schema verification/generation when appropriate.
- Never print secrets from `.env` or `.env.local`.

## Antigravity Role

Antigravity should:
- Work on code implementation.
- Inspect local files.
- Run safe verification.
- Create commits and push branches only when explicitly approved.
- Prepare PR titles/descriptions when asked.
- Update handoff docs after code work.
- Add entries to `docs/agent-handoff/codex-backlog.md` when GitHub Project cleanup is needed.
- Avoid GitHub Issue/Project writes unless explicitly instructed and supported.

Antigravity must not:
- Modify GitHub Issues or Project Board by default.
- Close epics/issues.
- Mark work Done on GitHub.
- Merge PRs unless explicitly instructed.
- Touch the old broken repo.

## Codex Role

Codex should:
- Handle GitHub Issues and GitHub Project Board.
- Read `docs/agent-handoff/active-checkpoint.md`.
- Read `docs/agent-handoff/codex-backlog.md`.
- Use the backlog as the source of truth for retroactive GitHub cleanup.
- Create/update issues only when instructed.
- Update labels, project fields, parent/sub-issue links, checklists, and completion comments.
- Move issues to Done only when the work is merged into `dev` and verified.

Codex must not:
- Modify code unless explicitly instructed.
- Create commits.
- Push.
- Merge branches.
- Delete branches unless explicitly instructed.
- Close Epic #8 unless the user explicitly approves.
- Touch unrelated issues or project boards.

## GitHub Project Rules

- Repo: nongwen-afk/Dashboard-Lung
- GitHub Project should reflect real merged work.
- Do not mark an issue Done unless implementation is merged into `dev` and verified.
- For work implemented by Antigravity while Codex was unavailable, Codex must read `codex-backlog.md` and update GitHub retroactively.
- Keep Priority, Size, Iteration, labels, assignee, and parent unchanged unless explicitly requested or clearly part of the cleanup.
- Completion comments should summarize what was implemented, what was verified, and what was intentionally not done.

## Handoff Rules

After every completed code task, update:
- docs/agent-handoff/active-checkpoint.md

If GitHub cleanup is pending, update:
- docs/agent-handoff/codex-backlog.md

The handoff should record:
- active issue or task
- branch
- PR number if any
- merge status
- deleted branch status
- verification results
- files changed summary
- remaining blockers
- GitHub cleanup needed for Codex

## Current Project State

Record:
- Fresh repo path is `/Users/microwen/Desktop/projects_lung/dashboard-lung`.
- Release PR #75 has been merged into `main`.
- Latest known main release commit: `9c77d82`.
- `dev` is clean and tracking `origin/dev`.
- UI Epic #68 and issues #70-#74 are Done/Closed.
- Codex backlog currently has no pending cleanup items.
- Epic #8 remains open and must not be closed unless the user explicitly approves.
