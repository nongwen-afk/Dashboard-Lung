# Business Rules

## BR-001 Vehicle and Primary Driver

Every vehicle has one active primary driver relationship.

This relationship is stored in `VehiclePrimaryDriver`.

VehiclePrimaryDriver must preserve relationship history with:

- `start_date`
- `end_date`
- `is_active`

Active relationship constraints:

- One vehicle can have only one active primary driver.
- One driver can be active primary driver for only one vehicle.

## BR-002 Reserve Driver

Reserve drivers do not have fixed vehicles.

Reserve drivers can replace unavailable primary drivers.

## BR-003 Assignment

One Assignment represents one scheduled departure.

Assignment contains:

- Date
- Departure time
- Vehicle
- Driver
- Route

Recommended uniqueness rules:

- `vehicle_id + assignment_date + departure_time` must be unique.
- `driver_id + assignment_date + departure_time` must be unique.

## BR-004 Route Assignment

Routes are assigned through Assignments, not Vehicles.

A vehicle may run different routes on different assignments.

## BR-005 Events

Every operational change should generate an Event.

Examples:

- Driver leave
- Driver absent
- Vehicle breakdown
- Maintenance
- Driver swap
- Vehicle swap

Event relationships may be nullable:

- `events.assignment_id`
- `events.vehicle_id`
- `events.driver_id`
- `events.route_id`
- `events.created_by`

These fields are nullable because some event types may not involve every operational entity, and future system-generated events may not have a user creator.

## BR-006 Recommendation Approval

AI recommendations do not modify Assignments automatically.

Dispatcher approval is required.

Recommendations must reference an Assignment in V1 through required `recommendations.assignment_id`.

## BR-007 Recommendation Status

Recommendation statuses:

- Pending
- Accepted
- Rejected
- Expired

While status is `pending`:

- `recommendations.resolved_by` may be nullable.
- `recommendations.resolved_at` may be nullable.

## BR-008 Historical Preservation

Historical records should be preserved when practical.

Avoid overwriting important operational history.

## BR-009 Dispatcher First UX

The dispatcher should see:

1. Current situation
2. Recommendation
3. Reason
4. Confirm action
5. Updated board

## BR-010 Admin Management

Admin can manage master data but should not interfere with live dispatch flow unless necessary.

## BR-011 User and Better Auth

User represents authenticated system users conceptually.

Better Auth owns the auth identity table and related auth core tables.

Project Lung should use `user_profiles` for application-level user data instead
of creating a standalone custom `users` table.

`user_profiles.user_id` should map 1:1 to the Better Auth user id.

Role, status, display profile fields, and operational user preferences belong in
`user_profiles`.

Better Auth auth table generation and review should happen before or together
with Project Lung profile schema planning.
