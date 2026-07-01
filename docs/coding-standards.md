# Coding Standards

## Language

Use TypeScript.

## Package Manager

Use npm.

## Formatting

Use Prettier.

Commands:

```bash
npm run format
npm run format:check
```

## Quality Checks

Before creating a PR, run:

```bash
npm run lint
npm run typecheck
npm run build
npm run format:check
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
