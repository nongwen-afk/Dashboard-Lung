# Architecture

## Overview

Project Lung uses a full-stack Next.js architecture.

The application contains:

- Admin Panel
- Dispatcher Operations Board
- API Route Handlers
- Server Actions
- Database layer using Drizzle ORM
- Supabase PostgreSQL database
- Better Auth authentication

## High-Level Architecture

```text
User Browser
    ↓
Next.js App Router
    ↓
Server Components / Client Components
    ↓
Route Handlers / Server Actions
    ↓
Drizzle ORM
    ↓
Supabase PostgreSQL
```

## Architecture Layers

### Presentation Layer

Responsible for UI:

- Admin layouts
- Dispatcher mobile-first board
- Forms
- Tables
- Cards
- Status badges

### Application Layer

Responsible for business actions:

- Create assignment
- Update assignment status
- Record event
- Generate recommendation
- Approve recommendation

### Domain Layer

Responsible for business rules:

- Driver availability
- Vehicle status
- Route assignment
- Reserve driver replacement
- Recommendation rules

### Data Layer

Responsible for database access:

- Drizzle schema
- Drizzle queries
- Migrations

## Folder Direction

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

## Design Rules

- Keep business logic outside UI components.
- Use feature-based organization.
- Use shared UI components.
- Use type-safe database queries.
- Avoid duplicated domain logic.
