# API Design

## Direction

Use Next.js Route Handlers and Server Actions.

## API Groups

### Admin

- routes
- vehicles
- drivers
- assignments
- events

### Dispatcher

- operations board
- recommendations
- approvals

### Recommendation

- generate recommendation
- approve recommendation
- reject recommendation

## Principles

- Validate input with Zod in the future
- Keep database logic in services
- Keep UI components clean
- Return consistent error structures

## Example Endpoints

```text
GET /api/routes
GET /api/vehicles
GET /api/drivers
GET /api/assignments
POST /api/events
POST /api/recommendations
POST /api/recommendations/:id/approve
POST /api/recommendations/:id/reject
```
