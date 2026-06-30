# Database Design

## Core Tables

- user_profiles
- drivers
- vehicles
- vehicle_primary_drivers
- routes
- assignments
- events
- recommendations

These tables represent the confirmed V1 core entities:

- User
- Driver
- Vehicle
- VehiclePrimaryDriver
- Route
- Assignment
- Event
- Recommendation

Better Auth-owned auth core tables are part of the authentication
implementation and should be generated or reviewed during Better Auth
integration. Project Lung should not create a standalone custom `users` table
before that integration.

## Users / User Profiles

Purpose:

Represents authenticated system users at the domain level.

Implementation strategy:

- Better Auth owns the auth identity table and related auth core tables.
- Project Lung owns `user_profiles` for application-level user data.
- `users` in earlier documentation means the authenticated user conceptually,
  not a required standalone Project Lung table.
- Future schema work should create `user_profiles`, not a standalone custom
  `users` table.
- `user_profiles.user_id` should map 1:1 to the Better Auth user id.

Suggested `user_profiles` fields:

- user_id
- display_name
- role
- status
- created_at
- updated_at

Roles:

- admin
- dispatcher

Relationship notes:

- User represents authenticated system users.
- Better Auth manages auth identity data such as login credentials, sessions,
  accounts, verification data, and auth-owned user metadata.
- Project Lung app-level role, status, display profile fields, and operational
  preferences belong in `user_profiles`.
- `events.created_by` and `recommendations.resolved_by` should reference an
  authenticated system user conceptually. The final physical foreign key should
  be decided during Better Auth and `user_profiles` schema implementation.

## Drivers

Purpose:

Stores driver information.

Suggested fields:

- id
- employee_code
- full_name
- phone
- driver_type
- status
- created_at
- updated_at

Driver types:

- primary
- reserve

## Vehicles

Purpose:

Stores EV bus information.

Suggested fields:

- id
- vehicle_code
- license_plate
- capacity
- status
- created_at
- updated_at

## Vehicle Primary Drivers

Purpose:

Stores long-term primary driver assignment.

Suggested fields:

- id
- vehicle_id
- driver_id
- start_date
- end_date
- is_active
- created_at
- updated_at

Relationship notes:

- `vehicle_id` references `vehicles.id`.
- `driver_id` references `drivers.id`.
- This table preserves primary driver history over time.
- `start_date`, `end_date`, and `is_active` identify the active period.

Constraints:

- One vehicle can have only one active primary driver.
- One driver can be active primary driver for only one vehicle.
- Historical records should remain after a primary driver changes.

## Routes

Purpose:

Stores route information.

Suggested fields:

- id
- name
- origin
- destination
- is_active
- created_at
- updated_at

## Assignments

Purpose:

Stores scheduled departure.

Suggested fields:

- id
- assignment_date
- departure_time
- vehicle_id
- driver_id
- route_id
- status
- note
- created_at
- updated_at

Relationship notes:

- `vehicle_id` references `vehicles.id`.
- `driver_id` references `drivers.id`.
- `route_id` references `routes.id`.
- Assignment represents one scheduled departure.
- Route assignment belongs on Assignment, not Vehicle.

Recommended uniqueness rules:

- `vehicle_id + assignment_date + departure_time` must be unique.
- `driver_id + assignment_date + departure_time` must be unique.

## Events

Purpose:

Stores operational events.

Suggested fields:

- id
- event_type
- description
- assignment_id
- vehicle_id
- driver_id
- route_id
- created_by
- created_at

Relationship notes:

- `assignment_id` references `assignments.id` and may be nullable.
- `vehicle_id` references `vehicles.id` and may be nullable.
- `driver_id` references `drivers.id` and may be nullable.
- `route_id` references `routes.id` and may be nullable.
- `created_by` references the authenticated user and may be nullable.
- Event relationships are nullable because some events may involve only a vehicle, only a driver, only an assignment, or a system-generated event.

## Recommendations

Purpose:

Stores recommendations.

Suggested fields:

- id
- assignment_id
- recommendation_type
- reason
- confidence
- status
- created_at
- resolved_at
- resolved_by

Relationship notes:

- `assignment_id` references `assignments.id` and should be required in V1.
- `resolved_by` references the authenticated user and may be nullable.
- `resolved_at` may be nullable while status is `pending`.
- Recommendations must remain human-controlled and require dispatcher approval before affecting operations.

## Important Notes

- Assignment is the central operational table.
- Event can optionally reference Assignment, Vehicle, Driver, Route, and User.
- Recommendation must reference Assignment in V1.
- VehiclePrimaryDriver is for long-term relationship history.
- Assignment is for actual operation per departure.
- Vehicles do not store route directly.
