# Module 12 — Audit, Notifications & Tournament-Day Operations

## Objective
Turn the hardened tournament platform into an operationally observable system. Staff should be able to see exceptions quickly, record match incidents separately from free-form notes, and trace who changed important tournament data.

## Added
- `/dashboard/operations` attention and audit center.
- Persistent `OperationalNotification` model for exceptional operational alerts.
- `MatchIncident` model for injuries, cards, discipline, technical/weather/crowd/protest/medical incidents.
- Match incident create/read/resolve APIs.
- Match-day incident panel integrated into live control.
- Activity log metadata and request-id storage.
- Audit-log and operational-notification APIs.
- Permission-aware dashboard sidebar.
- Persistent alerts for warning/critical incidents and disrupted fixtures.

## Attention queue
The operations page derives live issues rather than storing noisy duplicate notifications for normal conditions:
- unresolved match incidents;
- confirmed paid-event registrations without completed payment;
- confirmed registrations without an event roster;
- delayed, suspended, postponed, abandoned or no-result fixtures;
- unread persistent operational notifications;
- recent staff audit history.

## Authorization pattern
No second auth system was introduced. Module 12 continues the boilerplate-style pattern:

`Auth.js session -> server-backed session validation -> permission strings -> server policy checks`

New permissions:
- `operations.view`
- `operations.manage`
- `audit.view`

ADMIN receives all three. SCORER receives operations view/manage so scorers can record match-day incidents, but not payment/tournament-admin permissions. MODERATOR receives operations/audit view only.

## Database changes
Prisma schema additions:
- `ActivityLog.metadata`
- `ActivityLog.requestId`
- ActivityLog indexes
- `OperationalNotification`
- `MatchIncident`
- notification / incident enums

Run against the test/demo MongoDB first:

```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run build
```

## Validation performed
- Repository API/library `.js` syntax: PASS
- Changed JSX transpile parse: PASS
- Local `@/` imports across JS/JSX: 0 unresolved
- No empty/suspicious copy/dummy/backup files found in the working project
- Prisma CLI was not installed in this execution copy, so schema validation must still be run locally.

## Suggested functional test
1. Log in as SCORER.
2. Open a live match and record a WARNING injury incident.
3. Confirm it appears in Match Incidents and `/dashboard/operations`.
4. Change match status to SUSPENDED and confirm a persistent critical/warning alert appears.
5. Resolve the incident and confirm it leaves the open-incident count.
6. Log in as ADMIN and inspect audit records.
7. Verify SCORER sidebar does not expose Payments/Sponsors/Settings.
8. Verify ADMIN still sees the full management navigation.
