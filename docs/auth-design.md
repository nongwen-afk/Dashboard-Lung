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
