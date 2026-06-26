# AI Recommendation Design

## Goal

The Recommendation Engine helps dispatchers decide what to do when an operational event occurs.

The MVP should start as rule-based, not LLM-based.

## Recommendation Types

- Replace Driver
- Replace Vehicle
- Change Route
- Assign Reserve Driver

## Inputs

- Current Assignment
- Driver status
- Vehicle status
- Route status
- Reserve driver availability
- Event type

## Output

Recommendation should include:

- recommendation_type
- target_assignment_id
- reason
- confidence
- status

## Example

Event:

Driver for A03 is on leave.

Recommendation:

Use Reserve Driver 1 for A03.

Reason:

- Reserve Driver 1 is available
- Reserve Driver 1 has no current assignment
- A03 must depart soon

## Important Rule

Recommendation does not apply changes automatically.

Dispatcher must approve or reject.
