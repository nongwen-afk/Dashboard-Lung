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
