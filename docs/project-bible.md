# Project Lung Bible

## 1. Project Vision

Project Lung is a Decision Support System (DSS) for EV Bus Dispatch Operations.

The system is not a booking system, not a traditional fleet dashboard, and not a KPI-heavy analytics system. The core purpose is to help dispatchers make quick operational decisions.

The main workflow is:

1. See current situation
2. Detect problems
3. Generate recommendation
4. Explain the reason
5. Dispatcher confirms
6. Operations board updates immediately

The system is designed for dispatchers who may be older users, use mobile devices often, and prefer simple interfaces similar to LINE or Excel.

## 2. Main User Types

### Admin

Admin users manage the system.

Admin responsibilities:

- Manage routes
- Manage vehicles
- Manage drivers
- Manage reserve drivers
- View system dashboard
- View analytics
- Configure settings
- Review operational history

Admin UI is desktop-first but responsive.

### Dispatcher / User

Dispatcher users operate the daily dispatch board.

Dispatcher responsibilities:

- View route status
- View vehicle-driver assignments
- Review problems
- Review AI recommendations
- Add notes if needed
- Confirm or reject recommendations

Dispatcher UI is mobile-first and designed for fast decision making.

## 3. Business Context

The operation has:

- 3 routes
- 15 EV buses
- 15 primary drivers
- 2 reserve drivers

Routes are referred to by color names:

- Green Line
- Red Line
- Blue Line

Vehicles and primary drivers are usually paired long-term. Reserve drivers do not have fixed vehicles and can replace any unavailable primary driver.

## 4. Core Philosophy

Do not make the dispatcher think. Make the dispatcher confirm.

The system should not overload the dispatcher with dashboards, charts, and hidden menus. It should show the current situation, recommendation, reason, and confirmation action.

## 5. Architecture Philosophy

Project Lung follows a domain-first development approach.

Development order:

1. Domain Model
2. Business Rules
3. Entity Design
4. ER Diagram
5. Drizzle Schema
6. Migration
7. API
8. UI
9. Recommendation Engine
10. Deployment

Database schemas should not be implemented before the domain model and business rules are clear.

## 6. Core Entities

The core entities are:

- User
- Driver
- Vehicle
- VehiclePrimaryDriver
- Route
- Assignment
- Event
- Recommendation

These entities are enough for MVP and provide a clean foundation for future expansion.

## 7. Operational Layers

### Master Data

Stable data that changes infrequently:

- User
- Driver
- Vehicle
- VehiclePrimaryDriver
- Route

### Daily Operation

Data generated during operations:

- Assignment
- Event

### Decision Layer

AI or rule-based recommendation data:

- Recommendation

## 8. Assignment as the Center

Assignment is the center of daily operations.

An Assignment represents one scheduled departure. It connects:

- Date
- Departure time
- Vehicle
- Driver
- Route
- Status

This allows the system to answer:

- Which vehicle is running?
- Who is driving?
- Which route?
- What time?
- What status?

## 9. Event Log

Event represents every important operational event.

Examples:

- Driver leave
- Driver absent
- Vehicle breakdown
- Maintenance
- Swap driver
- Swap vehicle
- Manual override
- Recommendation applied

Events should be append-only whenever possible.

## 10. Recommendation

Recommendation represents a system-generated suggestion.

Examples:

- Replace driver
- Replace vehicle
- Change route
- Assign reserve driver

Recommendation status:

- Pending
- Accepted
- Rejected
- Expired

The system must not apply recommendations automatically. Dispatcher confirmation is required.

## 11. Technology Stack

Frontend:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui

Backend:

- Next.js Route Handlers
- Server Actions

Database:

- Supabase PostgreSQL
- Drizzle ORM

Authentication:

- Better Auth

Deployment:

- Vercel

Package Manager:

- pnpm

Code Quality:

- ESLint
- Prettier

## 12. Branch Strategy

- `main` = stable / demo-ready
- `dev` = active integration branch
- `feature/*` = feature work
- `chore/*` = setup/config work
- `docs/*` = documentation work
- `fix/*` = bug fixes
- `refactor/*` = refactoring

All work should be merged into `dev` through Pull Requests.

## 13. MVP Priorities

MVP should focus on:

1. Database design
2. Authentication
3. Admin management screens
4. Dispatcher operations board
5. Event logging
6. Rule-based recommendations
7. Approval workflow

Avoid overbuilding analytics or complex AI before core operations work.

## 14. Future Expansion

Future features may include:

- Notifications
- Audit logs
- Advanced analytics
- Driver workload balancing
- Vehicle maintenance module
- Mobile PWA support
- Multi-depot support
- Real-time updates
