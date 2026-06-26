# Database Design

## Core Tables

- users
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

## Users

Purpose:

Stores system users.

Suggested fields:

- id
- name
- email
- role
- status
- created_at
- updated_at

Roles:

- admin
- dispatcher

Relationship notes:

- User represents authenticated system users.
- Better Auth may manage its own user table.
- Final table naming must be reviewed during Better Auth integration.
- If needed, application-level user data should move to `user_profiles`.

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
