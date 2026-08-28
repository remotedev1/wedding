# Module 08 — Tournament Scheduling & Fixture Generation

## Scope
This module hardens tournament scheduling on top of Module 7. It does not change payment behavior or the public site.

## Added
- `lib/tournament/scheduling.js`: shared match-duration, overlap, round-robin and pool-distribution helpers.
- `POST /api/tournaments/:tournamentId/fixtures/generate`: preview/commit pool-stage fixture generator.
- Professional fixture generator dialog in the tournament Matches screen.

## Generator behavior
- Uses confirmed `GameRegistration` records only.
- Preserves valid existing pool assignments and can balance unassigned registrations into 1–8 pools.
- Generates deterministic round-robin pool pairings.
- Supports one or more venues and schedules independent matches in parallel where safe.
- Enforces a configurable minimum rest period between generated matches for the same family.
- Rejects regeneration when the event already contains non-cancelled fixtures.
- Preview mode performs no writes; commit mode updates pool assignments and creates matches.
- Rejects a generated schedule that extends past the tournament end date.

## Conflict hardening
Manual match creation and rescheduling now use time-window overlap checks rather than checking only an identical `scheduledOn` timestamp. Venue and participating-family conflicts are both rejected.

The current schema does not store a duration per match, so conflict windows use conservative sport defaults. The generator accepts an explicit slot duration for the event. A future module can promote duration to tournament-game configuration if operators need event-specific timings.

## Additional fixes
- Match edit form now reads the canonical embedded participant keys (`familyId`, `family`) while retaining compatibility with the old `teamId`/`teamName` shape.
- Removed a duplicated `@@unique([tournamentId, familyId])` declaration from `TournamentParticipation` in the Prisma schema.

## Safety / permissions
Fixture generation requires Match CREATE permission, so SCORER cannot generate or redesign the fixture schedule. Existing scorer live-control permissions remain unchanged.

## Validation
Changed non-JSX JavaScript files pass `node --check`. Local alias imports in the changed JSX files were checked for resolvability. Full Next.js/Prisma build validation still requires dependencies and the project database environment.

## Recommended local validation
```bash
npm install
npx prisma generate
npx prisma validate
npm run build
```
Then preview fixtures first on the demo database, verify pools/times/grounds, and only then commit.
