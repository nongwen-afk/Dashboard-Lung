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

## Important Notes

- Assignment is the central operational table.
- Event and Recommendation can reference Assignment.
- VehiclePrimaryDriver is for long-term relationship.
- Assignment is for actual operation per departure.
