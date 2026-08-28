# Phase 2 · Module 12 — Fixture Operations & Match-Day Scheduling v2

## Added
- Protected day-by-day Fixture Schedule Board.
- Fast inline rescheduling without drag/drop complexity.
- Venue reassignment using normalized tournament venues.
- Server-side venue overlap rejection.
- Server-side participating-team overlap rejection.
- Team rest warnings when turnaround is below 90 minutes.
- Scorer / technical-official coverage warnings.
- Fixture publication state with bulk Publish / Hide.
- Delayed, postponed and cancelled operational states.
- Started/completed fixtures cannot be casually rescheduled from the board.
- Links from Tournament Command Center and Tournament Control.

## Safety
Schedule conflict rules remain authoritative on the server. UI warnings are advisory; invalid overlapping updates are rejected by the API.

## Security
The page uses the existing boilerplate `OPERATIONS_VIEW` permission and write operations continue through MATCH resource authorization.

## Database
No Prisma schema change.
No migration.
No new dependency.
