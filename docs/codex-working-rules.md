# Codex Working Rules

Use this file as the master prompt for Codex when working on Project Lung.

Project Lung is a Decision Support System for EV Bus Dispatch Operations.

Before doing any work, read these documents:

- `docs/project-bible.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/business-rules.md`
- `docs/database-design.md`
- `docs/er-diagram.md`
- `docs/decisions.md`
- `docs/codex-playbook.md`

---

## Important Working Rules

Do not act independently on project management decisions.

You must wait for confirmation before:

- Moving any GitHub issue status
- Closing any GitHub issue
- Editing any GitHub issue description
- Creating new issues
- Renaming issues
- Changing labels, priority, size, or sprint
- Changing database architecture
- Renaming entities
- Changing documented business rules
- Changing Git branch strategy
- Adding new libraries
- Replacing existing libraries
- Changing folder structure
- Refactoring large parts of the project

---

## How to Work

Work step by step.

For every task, follow this process:

1. Explain what issue or task you are working on.
2. Explain what files you plan to inspect.
3. Explain what files you plan to change.
4. Wait for confirmation before making changes if the change affects architecture, database design, issue management, or documentation.
5. Make only the approved changes.
6. After making changes, summarize exactly what changed.
7. Explain what still remains.
8. Tell the user what command to run to verify the work.
9. Wait for the result before continuing.

---

## Communication Format

Always explain your current status clearly.

Use this format when working:

### Current Task

State the issue or task being worked on.

### Current Status

Explain what has already been done.

### What I Am Doing Now

Explain what you are currently checking or editing.

### Files Involved

List files that will be read or modified.

### Proposed Changes

Explain changes before applying them.

### Waiting For Confirmation

Ask for confirmation before continuing when needed.

### Verification

Provide commands to run, such as:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```

---

## Do Not Skip Confirmation

If you are unsure whether a change is small or important, ask first.

Do not make hidden architectural decisions.

Do not silently change database relationships.

Do not silently update documentation to match your own assumptions.

---

## Project Architecture Rules

Follow the existing architecture:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase PostgreSQL
- Drizzle ORM
- Better Auth
- pnpm
- Vercel

---

## Domain Rules

The core entities are:

- User
- Driver
- Vehicle
- VehiclePrimaryDriver
- Route
- Assignment
- Event
- Recommendation

Do not rename these entities unless explicitly approved.

Assignment represents one scheduled vehicle departure.

VehiclePrimaryDriver stores the long-term relationship between a vehicle and its primary driver.

Event stores operational changes.

Recommendation stores AI-generated suggestions that require dispatcher approval.

---

## Git Workflow

Use this branch strategy:

- `main` = stable / demo-ready
- `dev` = active development
- `feature/*` = feature work
- `chore/*` = setup/config work
- `docs/*` = documentation
- `fix/*` = bug fixes
- `refactor/*` = refactoring

Do not merge branches unless explicitly asked.

Do not delete branches unless explicitly asked.

Pull Requests should target `dev` unless told otherwise.

---

## GitHub Project Rules

Do not move issue status automatically.

Do not mark checklists complete automatically.

Do not close issues automatically.

Instead, after completing work, say:

> The implementation appears complete. Please review and confirm before moving the issue to Done.

---

## Database Rules

Do not create database schemas until the ER Diagram and Business Rules are confirmed.

When implementing database schemas:

- Use Drizzle ORM
- Use Supabase PostgreSQL
- Generate migrations
- Do not manually edit production database
- Do not add unnecessary tables
- Preserve historical data when practical

---

## Documentation Rules

If code changes affect architecture, update documentation.

Before updating documentation, explain the proposed documentation changes and wait for confirmation.

---

## Final Response After Each Step

After each step, respond with:

1. What was done
2. What files changed
3. What commands were run or should be run
4. Whether the task is ready for review
5. What should be confirmed next

Never continue to the next major step without confirmation.

---

# Reusable Issue Prompt

Use this when starting a specific GitHub issue.

```md
We are working on Project Lung.

Before starting, read:

- docs/project-bible.md
- docs/codex-working-rules.md
- docs/codex-playbook.md
- docs/architecture.md
- docs/domain-model.md
- docs/business-rules.md
- docs/database-design.md
- docs/er-diagram.md
- docs/decisions.md

Current issue:

[INSERT ISSUE TITLE]

Goal:

[INSERT GOAL]

Acceptance Criteria:

[INSERT ACCEPTANCE CRITERIA]

Definition of Done:

[INSERT DEFINITION OF DONE]

Working rules:

- Do not move the issue status.
- Do not close the issue.
- Do not edit the issue description.
- Do not change architecture without asking.
- Do not make unrelated changes.
- Explain your plan first.
- Wait for confirmation before implementation.
- After implementation, summarize what changed and tell me what commands to run.

Start by explaining your understanding of the task and your implementation plan.
```

---

# Review-Only Prompt

Use this when you want Codex to inspect work without editing files.

```md
Review the current project state for Project Lung.

Do not modify any files yet.

Please inspect the relevant files and report:

1. What is already completed
2. What is missing
3. What looks risky
4. What should be done next
5. Which files would need changes

Wait for my confirmation before editing anything.
```

---

# PR Review Prompt

Use this before opening a Pull Request.

```md
Review this branch before I open a Pull Request.

Do not modify files yet.

Please check:

- Code quality
- TypeScript issues
- Formatting issues
- Architecture consistency
- Documentation consistency
- Whether the changes match the related GitHub issue
- Whether unrelated files were changed

Then provide:

1. Summary
2. Issues found
3. Recommended fixes
4. Commands I should run
5. Whether it is ready for PR

Wait for my confirmation before making changes.
```
