# Deployment Plan

## Platform

Vercel

## Environments

- Local
- Preview
- Production

## Environment Variables

Required:

```env
DATABASE_URL=""
```

Future:

```env
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL=""
```

## Deployment Flow

1. PR to dev
2. Preview deployment
3. Test
4. Merge to dev
5. Merge dev to main for production/demo

## Notes

Deployment should be configured after database and authentication are stable.
