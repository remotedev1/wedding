# Professional Staff & Match Officials Core

Implemented:
- linked staff-account assignments plus external officials;
- scorer/referee/umpire/technical/timekeeper/commissioner roles;
- overlapping-match double-booking prevention;
- batched staff availability/workload lookup;
- assignment lifecycle: ASSIGNED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW;
- audit logging for assignments and status changes;
- scorer authorization restricted to assigned SCORER/TECHNICAL_OFFICIAL duties;
- tournament staff operations page with coverage gaps, workload, check-ins and no-shows;
- live Match Control assignment/check-in UI.

Database changes:
- `OfficialAssignmentStatus`
- `MatchOfficial.status`
- `checkedInAt`, `checkedOutAt`, `assignedById`

After `prisma db push`, run `npm run db:backfill-match-officials`.
