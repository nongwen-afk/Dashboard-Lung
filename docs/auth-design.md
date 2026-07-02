# Authentication Design

## Tool

Better Auth

## Better Auth User Table Strategy

Better Auth owns auth identity.

Project Lung owns `user_profiles` for application-level user data.

`user_profiles.user_id` should reference the Better Auth user id with a 1:1
relationship.

The Better Auth auth user table should contain auth-owned identity fields and
must not be duplicated by a standalone custom Project Lung `users` table.

Project Lung role, status, display profile fields, and future operational
preferences belong in `user_profiles`.

Better Auth implementation must happen before or together with profile schema
planning so generated auth tables, table names, and foreign key strategy are
reviewed before Project Lung schema work continues.

## Confirmed Better Auth Schema

Issue #29 generated the initial Better Auth Drizzle schema for PostgreSQL.

Generated auth-owned tables:

- `user`
- `session`
- `account`
- `verification`

The Better Auth user table name is `user`.

The Better Auth user id column is `user.id` with Drizzle/PostgreSQL type `text`.

No Project Lung `user_profiles` table is created in #29.

## Handoff to User Profiles Schema

#17 Create User Profiles Schema should create Project Lung-owned
`user_profiles` after #29.

Handoff decisions for #17:

- `user_profiles.user_id` should map 1:1 to Better Auth `user.id`.
- `user_profiles.user_id` should use a compatible text/string id type unless
  the auth user id strategy changes before migration.
- Project Lung role, status, display profile fields, and operational
  preferences belong in `user_profiles`.
- Do not add Project Lung role/status/profile fields to the Better Auth `user`
  table.

## Roles

- admin
- dispatcher

## Admin Access

Admin can access:

- Admin dashboard
- Route management
- Vehicle management
- Driver management
- Settings
- Analytics

## Dispatcher Access

Dispatcher can access:

- Operations board
- Recommendations
- Approval actions

## Rule

Authentication should be simple.

Role-based access control should protect routes and actions.
