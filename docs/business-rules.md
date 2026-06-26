# Business Rules

## BR-001 Vehicle and Primary Driver

Every vehicle has one active primary driver relationship.

This relationship is stored in `VehiclePrimaryDriver`.

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

## BR-006 Recommendation Approval

AI recommendations do not modify Assignments automatically.

Dispatcher approval is required.

## BR-007 Recommendation Status

Recommendation statuses:

- Pending
- Accepted
- Rejected
- Expired

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
