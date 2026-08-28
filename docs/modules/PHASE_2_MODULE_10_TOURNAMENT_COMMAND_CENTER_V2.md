# Phase 2 · Module 10 — Tournament Command Center v2

## Added
- `/dashboard/command-center` protected operations cockpit.
- Active tournament scoped live and next-match queue.
- Prioritized action queue for incidents, disrupted fixtures, pending registrations, unsettled confirmed registrations and roster readiness.
- Registration readiness matrix derived from confirmation, payment and minimum roster configuration.
- Potential venue-overlap detection using scheduled duration (60-minute conservative fallback).
- Upcoming scorer/technical-official coverage checks.
- Direct links into live match control, participants, venues and matches.
- Dashboard and sidebar entry points.

## Security
Uses the existing boilerplate permission system and requires `OPERATIONS_VIEW`. No alternate auth path was introduced.

## Database
No Prisma schema change.
No new dependency.

## Important
Venue overlap is an operational warning, not an automatic scheduling decision. Unknown match duration uses a conservative 60-minute estimate.
