# Coding Standards

## Language

Use TypeScript.

## Package Manager

Use pnpm.

## Formatting

Use Prettier.

Commands:

```bash
pnpm format
pnpm format:check
```

## Quality Checks

Before creating a PR, run:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

## Components

- Prefer small reusable components.
- Keep UI components simple.
- Keep business logic outside UI components.

## Database

- Use Drizzle ORM.
- Keep schema definitions clear.
- Generate migrations.
- Do not manually edit production database structure unless necessary.
