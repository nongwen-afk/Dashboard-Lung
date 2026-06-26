# Decisions

This file records confirmed architecture and database relationship decisions for Project Lung.

## ADR-001: Use Assignment as the center of daily operations

Status: Accepted

Decision:

Assignment represents one scheduled departure and connects date, departure time, vehicle, driver, route, and status.

Reason:

Daily dispatch operations need a single operational center that can answer which vehicle runs, who drives, on which route, and at what time.

Implications:

- Assignments should reference Vehicle, Driver, and Route.
- Vehicle and Driver scheduling conflicts should be prevented per departure time.
- Events and Recommendations can connect back to Assignment when relevant.

## ADR-002: Use nullable relationships for Events

Status: Accepted

Decision:

`events.assignment_id`, `events.vehicle_id`, `events.driver_id`, and `events.route_id` may be nullable.

`events.created_by` may also be nullable.

Reason:

Some events may involve only a vehicle, only a driver, only an assignment, or another partial operational context. Future system-generated events may not have a user creator.

Implications:

- Event records must be able to describe partial operational context.
- Application logic should not assume every event has every related entity.
- Event history remains flexible without requiring artificial placeholder records.

## ADR-003: Keep Recommendation approval human-controlled

Status: Accepted

Decision:

Recommendations do not modify operations automatically. Dispatcher approval is required.

`recommendations.assignment_id` should be required in V1.

`recommendations.resolved_by` and `recommendations.resolved_at` may be nullable while status is `pending`.

Reason:

Project Lung is a decision support system. The system should recommend and explain, while dispatchers confirm or reject actions.

Implications:

- Recommendation status must support `pending`, `accepted`, `rejected`, and `expired`.
- Pending recommendations may not have resolver data yet.
- Accepted recommendations should record who resolved them and when.

## ADR-004: Store primary driver relationships in VehiclePrimaryDriver

Status: Accepted

Decision:

Long-term primary driver relationships are stored in `VehiclePrimaryDriver`.

Reason:

Primary driver assignments change over time and must preserve history.

Implications:

- Vehicle should not store primary driver directly.
- Driver should not store primary vehicle directly.
- `start_date`, `end_date`, and `is_active` identify relationship periods.

## ADR-005: Enforce one active primary driver per vehicle

Status: Accepted

Decision:

One vehicle can have only one active primary driver.

Reason:

Dispatch operations expect each vehicle to have a single active primary driver at a time.

Implications:

- Active `VehiclePrimaryDriver` records should be unique per vehicle.
- Historical records can remain after `end_date` is set and `is_active` is false.

## ADR-006: Enforce one active primary vehicle per driver

Status: Accepted

Decision:

One driver can be active primary driver for only one vehicle.

Reason:

Primary driver pairing should not create conflicting active assignments.

Implications:

- Active `VehiclePrimaryDriver` records should be unique per driver.
- A driver may have historical primary vehicle records over time.

## ADR-007: Keep route assignment on Assignment, not Vehicle

Status: Accepted

Decision:

Route assignment belongs on Assignment, not Vehicle.

Reason:

A vehicle may run different routes on different scheduled departures.

Implications:

- Vehicle records should not store route directly.
- `assignments.route_id` identifies the route for each scheduled departure.
- Route history is preserved through assignments.

## ADR-008: Review User table naming during Better Auth integration

Status: Accepted

Decision:

User represents authenticated system users, but final table naming must be reviewed during Better Auth integration.

Reason:

Better Auth may manage its own user table and naming conventions.

Implications:

- The current `users` table name is documentation-level guidance, not final schema implementation.
- If needed, application-level user data should move to `user_profiles`.
- Database schema work must revisit this decision before implementation.
