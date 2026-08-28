# Module 04 — Tournament Control Workflow UX

## Goal
Turn the tournament detail area into a professional operator workflow and replace placeholder tournament operations with real database-backed actions.

## What changed

### Tournament command center
- Reworked `TournamentDetailsPage.jsx` into an operational control center.
- Added readiness checks, live/today/completed match counts, pending/unpaid registration warnings, and clear workflow navigation.
- Added direct paths for games, family registrations, fixtures/live scoring, placements, and sponsors.
- Added `includeGames` support to the tournament detail hook/API.

### Tournament detail API fixes
- Fixed `[tournamentId]` PATCH/DELETE handlers that still read `params.id`.
- Normalized activity logging to the authenticated user id.
- Tournament detail reads can now include game counts and game registration summaries.

### Family participation
- Replaced the old placeholder participant screen with the real Prisma workflow.
- Added `/api/tournaments/[tournamentId]/participants` GET/POST.
- Added `/api/tournaments/[tournamentId]/participants/[participationId]` DELETE.
- Admin can add an existing family to a tournament.
- Duplicate participation is rejected.
- A family cannot be removed while game registrations still exist.
- Added real CSV export.
- Removed misleading sport/pool fields from tournament participation UI; event-level registration belongs to `GameRegistration`.

### Placements
- Restored the previously broken placements route/page.
- Added database-backed placement creation and deletion.
- Only families registered in the tournament can receive placements.
- Sport/placement uniqueness continues to be enforced by Prisma.
- Placements are grouped by sport in the admin UI.

### Match workflow fixes
- Fixed mutation hook signatures that could generate `[object Object]` or `undefined` tournament URLs.
- Match delete now receives the tournament id.
- Normalized the single-match response shape.
- Games and matches now include a clear route back to tournament control.

### API cleanup
- Added `id` to the normalized auth user object while retaining `userId` as a temporary compatibility alias.
- Fixed sponsor `[sponsorId]` parameter handling.
- Removed unused/broken legacy `/api/tournaments/game` and global `/api/tournaments/matches` implementations after confirming no current code references them.
- Removed unused unparameterized global/live match dashboard pages.

## Validation
- `node --check` passed for all changed non-JSX JS/API files.
- All `@/` imports in changed files were checked and resolve to local project files.
- Searches confirmed the removed legacy tournament API routes had no current consumers.
- Full `npm ci`/Next build could not complete in the execution window and is therefore not claimed as certified.

## Local verification
Run:

```bash
npm install
npx prisma generate
npx prisma validate
npm run build
```

Then verify these workflows against the test/demo database:
1. Open a tournament control page.
2. Add an existing family to the tournament.
3. Confirm duplicate family registration is rejected.
4. Confirm a family with game registrations cannot be removed.
5. Create/edit/delete a tournament game.
6. Schedule/edit/delete a match.
7. Open live control from a match.
8. Record and remove a final placement.
9. Confirm role restrictions for ADMIN, SCORER, MODERATOR, and read-only users.
