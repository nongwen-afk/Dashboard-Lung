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

### Pending: UI Port from pleum

Known facts:

- Branch pleum exists locally and remotely.
- Latest known commit: 06737fc4c8ab59c5c7abb6a57f0059ac7a061158
- pleum has no merge base with dev.
- pleum uses src/app and src/components.
- dev uses root app and root components.
- Direct merge is unsafe.
- Manual port only.
- Do not create or keep src/app.
- Keep root app as the only Next.js App Router directory.
- Do not copy package/config/_1 files from pleum.
- Reusable parts: UI components, mock data, public assets, page ideas.

Expected GitHub work for Codex:

- Confirm whether [EPIC] MVP Dashboard UI was created.
- Confirm child issues were created:
  - Setup UI Dependencies & Base Configurations
  - Port Mock Data & State Management
  - Port Main Dashboard UI
  - Port Drivers & Analytics Pages
  - Resolve App Router Conflicts & Final UI Integration
- If not created, Codex should create them later when available and user-approved.
- Do not mark any UI issue Done until merged into dev and verified.

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
