# Deployment Plan

## Platform

Vercel

## Environments

- Local
- Preview
- Production

## Environment Variables

Required Database:

- **Production**: `DATABASE_URL` must point to the **Neon main branch**.
- **Preview / Local**: `DATABASE_URL` must point to the **Neon dev branch**.

Vercel Configuration:

- Set `DATABASE_URL` for the **Production** environment to the Neon main branch.
- Set `DATABASE_URL` for the **Preview** environment to the Neon dev branch. Do not limit this to just the `dev` branch, as all feature branch PRs need database access during preview.

Authentication (Currently Present but Implementation Paused):

```env
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL=""
```

## Deployment Flow

1. Developer creates a feature branch from `dev`.
2. Developer pushes and creates a PR to `dev`.
3. Vercel automatically creates a Preview deployment connected to the Neon `dev` database.
4. Test on the Preview URL.
5. Merge to `dev`.
6. When a release is ready, merge `dev` to `main` for Production.

## Notes & Safety

- **Canonical Database**: Neon is the canonical database provider. Supabase is no longer used.
- **Production Migrations**: Production schema migrations require explicit approval and should only happen after the migration has been thoroughly tested on the Neon `dev` branch.
- **Production Seed Data**: The Production database must **never** be seeded with mock data (`npm run db:seed:mock`).
- **Authentication**: Better Auth environment variables are currently configured in Vercel, but full Better Auth implementation remains paused. Mock Auth UI remains active.
