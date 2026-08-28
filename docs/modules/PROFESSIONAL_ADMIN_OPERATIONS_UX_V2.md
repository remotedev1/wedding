# Professional Admin Operations UX v2

This pass consolidates the tournament administration experience around an operations-first workflow.

## Added

- Tournament-scoped operations hub: `/dashboard/tournaments/:tournamentId/operations`.
- Sticky tournament workspace navigation shared across all tournament admin routes.
- Operations phase rail: Setup → Registration → Scheduling → Match day → Results.
- Prioritized exception queue with critical issues first.
- Live/next match operating queue.
- Registration readiness, venue integrity, scorer/referee coverage and incident health.
- Completed-payment value and official check-in visibility.
- Tournament overview now promotes Operations as the primary run-time action.
- Dashboard active tournament card opens directly into scoped Operations.
- Admin sidebar simplified into Operate / Tournament / Administration groups.

## Design rule

The administrator should not need to remember which CRUD screen contains a problem. The Operations hub surfaces the exception and links directly to the correcting workflow.

## Data behavior

The operations service can now operate in two modes:

- no tournament id → current active tournament (global Command Center);
- tournament id → explicit tournament workspace.

No new API or authentication path was introduced. Existing permission and resource boundaries remain authoritative.

## Database

No Prisma schema change in this UX pass.
