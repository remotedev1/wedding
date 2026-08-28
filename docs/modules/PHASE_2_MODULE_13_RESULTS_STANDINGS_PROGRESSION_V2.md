# Phase 2 · Module 13 — Results, Standings & Tournament Progression v2

## Added
- Protected Results & Progression center.
- Event-level completion status.
- Authoritative pool tables calculated only from completed/walkover matches.
- Visible qualification indicators for top-two positions.
- Explicit tie-break order: points → goal difference → goals scored → wins → deterministic family-name fallback.
- Knockout path across quarter-finals, semi-finals, third-place and final.
- Champion summary derived from a completed final.
- Result version / locked-result indicators.
- Final placements displayed beside competition progression.
- Links from Tournament Command Center and Tournament Control.

## Integrity
Standings are derived from match results rather than manually edited table rows. The existing knockout generator/progression remains the fixture authority. Result locking/version fields are surfaced rather than bypassed.

## Security
Uses the existing boilerplate `OPERATIONS_VIEW` permission and MATCH read authorization.

## Database
No Prisma schema change.
No migration.
No new dependency.
