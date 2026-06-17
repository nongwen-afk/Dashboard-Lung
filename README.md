# Project Lung

Decision Support System for EV Bus Dispatch Operations.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase
- Drizzle ORM
- Better Auth
- pnpm

## Architecture Decisions

- Use `pnpm` as the package manager
- Use Next.js Route Handlers and Server Actions for backend logic
- Use Supabase PostgreSQL as the primary database
- Use Drizzle ORM for schema, migrations, and type-safe queries
- Use Better Auth for authentication and role-based access control
- Use Role-Based Access Control (RBAC) for Admin and Dispatcher roles
- Use Vercel for deployment
- Use ESLint and Prettier for code quality

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm dev
```

Build project:

```bash
pnpm build
```

## Code Quality

Run quality checks before creating a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm format:check
```

Format code automatically:

```bash
pnpm format
```

All team members should run these commands before submitting code.

## Project Structure

```text
src/
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── services/
├── types/
├── constants/
└── utils/
```
