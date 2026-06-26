# Codex Playbook

## Before Coding

Read:

- docs/project-bible.md
- docs/architecture.md
- docs/domain-model.md
- docs/business-rules.md
- docs/decisions.md
- docs/er-diagram.md

## Rules

- Do not redesign database silently.
- Do not rename entities without approval.
- Keep documentation updated.
- Use existing architecture.
- Use pnpm.
- Use Drizzle ORM.
- Use Supabase PostgreSQL.
- Use Better Auth.

## When implementing

1. Understand the issue.
2. Check relevant docs.
3. Propose plan.
4. Implement.
5. Run checks.
6. Update docs if needed.

## Required Checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build
```
