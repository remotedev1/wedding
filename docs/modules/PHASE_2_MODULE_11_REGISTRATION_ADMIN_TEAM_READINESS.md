# Phase 2 · Module 11 — Registration Administration & Team Readiness

## Goal
Make staff approval authoritative and consistent with the Command Center.

## Added
- Shared `evaluateRegistrationReadiness()` rule engine.
- Single-entry confirmation now requires:
  - payment complete (or zero fee)
  - minimum roster satisfied
  - maximum roster not exceeded
  - manager name and phone
  - captain, when set, must belong to submitted roster
- Bulk confirmation uses exactly the same readiness engine and rejects blocked entries with per-entry reasons.
- Registration Control now shows Ready / Needs Action for each event entry.
- Readiness filters: All, Ready, Needs Action, Pending Review.
- Blocking reasons are visible before staff attempts confirmation.
- Command Center now uses the same readiness engine, eliminating drift between dashboard warnings and approval behavior.

## Duplicate protection
The existing database compound uniqueness `@@unique([gameId, participationId])` remains the final guarantee that the same family cannot have duplicate entry rows for one event.

## Security
No auth changes. Existing permission checks remain authoritative. No alternate approval endpoint bypasses readiness.

## Database
No Prisma schema change.
No new dependency.
