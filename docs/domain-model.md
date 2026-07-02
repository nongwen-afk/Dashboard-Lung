# Domain Model

## Entity Overview

The domain model contains eight core entities:

- User
- Driver
- Vehicle
- VehiclePrimaryDriver
- Route
- Assignment
- Event
- Recommendation

## User

Represents an authenticated system user conceptually.

Implementation note:

Project Lung user profile data is separate from Better Auth identity data.
Better Auth owns the auth user identity and related auth tables. Project Lung
owns `user_profiles` for role, status, display profile fields, and future
operational preferences.

`user_profiles.user_id` should map 1:1 to the Better Auth user id.

Roles:

- Admin
- Dispatcher

Responsibilities:

- Login
- Access system based on role
- Approve or reject recommendations
- Create operational events

## Driver

Represents a driver.

Driver can be:

- Primary driver
- Reserve driver

Driver status examples:

- Active
- Leave
- Absent
- Inactive

Important rule:

Driver is not the same as User. Drivers do not necessarily log in.

## Vehicle

Represents an EV bus.

Vehicle status examples:

- Available
- Running
- Maintenance
- Breakdown
- Inactive

Vehicles should not store route directly because routes are assigned per Assignment.

## VehiclePrimaryDriver

Represents the long-term relationship between a vehicle and its primary driver.

Fields should include:

- vehicle_id
- driver_id
- start_date
- end_date
- is_active

This preserves historical changes.

## Route

Represents a route.

Examples:

- Green Line
- Red Line
- Blue Line

Route fields should include:

- name
- origin
- destination
- is_active

No route_code is needed because routes are identified by color names.

## Assignment

Represents one scheduled departure.

Assignment connects:

- date
- departure time
- vehicle
- driver
- route
- status

Assignment is the center of daily operations.

## Event

Represents operational events.

Examples:

- Leave
- Absent
- Breakdown
- Maintenance
- Swap Driver
- Swap Vehicle
- Manual Override
- Recommendation Applied

## Recommendation

Represents system-generated recommendations.

Recommendation examples:

- Replace driver
- Replace vehicle
- Change route
- Assign reserve driver

Recommendation must be approved or rejected by dispatcher.
