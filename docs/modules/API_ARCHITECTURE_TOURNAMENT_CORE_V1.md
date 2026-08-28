# API Architecture Conversion v1 — Tournament Core

This pass converts the first major legacy API group to the Crafty-style module flow.

## Converted routes

The following routes no longer import or call Prisma directly:

- `GET/POST /api/tournaments`
- `GET/PATCH/DELETE /api/tournaments/:tournamentId`
- `GET/POST /api/tournaments/games`
- `GET/PATCH/DELETE /api/tournaments/games/:gamesId`
- `GET/POST /api/tournaments/:tournamentId/venues`
- `PATCH/DELETE /api/tournaments/:tournamentId/venues/:venueId`
- `POST /api/tournaments/:tournamentId/fixtures/generate`
- `POST /api/tournaments/:tournamentId/knockout/generate`
- `GET/PATCH/POST /api/tournaments/:tournamentId/matches/schedule-board`
- `GET /api/tournaments/:tournamentId/standings`
- `GET/POST /api/tournaments/:tournamentId/placements`
- `DELETE /api/tournaments/:tournamentId/placements/:placementId`
- `GET /api/tournaments/:tournamentId/results-center`

## Module flow

```text
route
  -> common API security/rate-limit setup
  -> Zod schema
  -> resource authorization
  -> tournament service
  -> tournament repository
  -> Prisma
```

New module boundaries:

```text
src/modules/tournaments/
├── schemas/core.js
├── core-service.js
├── fixture-service.js
├── results-service.js
├── repository.js
└── http.js
```

## Business rules moved out of route handlers

### Tournament lifecycle

Service layer now owns:

- start/end date validity;
- registration deadline validity;
- publication state;
- soft-cancel vs hard-delete decision.

### Events/games

Service layer now owns:

- event date inside tournament range;
- event registration deadline;
- min/max age validation;
- min/max roster validation;
- duplicate event-name checking;
- canonical minor-unit registration fee writes;
- safe deletion when registrations/matches exist.

### Venues

Service layer now owns:

- duplicate names;
- canonical slug creation;
- active-match deletion protection.

### Fixture generation

Fixture generation now owns:

- confirmed-entry requirements;
- duplicate schedule protection;
- team/venue overlap avoidance;
- rest-window enforcement;
- tournament end-boundary validation;
- pool assignment;
- explicit preview vs commit.

Commit now additionally uses:

```text
database-backed operation lock
  -> re-check existing schedule
  -> Prisma transaction
      -> pool assignments
      -> fixture creation
  -> release lock
```

This prevents two application instances from generating the same event schedule concurrently.

### Knockout generation

Manual knockout generation now has the same operation-lock/transaction boundary and rechecks existing knockout fixtures after acquiring the lock.

### Schedule board

Venue overlap, team overlap, rest warnings, publication updates and rescheduling restrictions now live in `fixture-service.js` instead of the HTTP handler.

### Standings/results/placements

Standings calculation and results-center assembly are module services. Placement validation verifies tournament participation, event registration and placement uniqueness before repository writes.

## Architecture debt reduction

Before:

```text
53 API route handlers with direct DB access
24 tournament-area direct-DB routes
```

After this pass:

```text
40 API route handlers with direct DB access
11 tournament-area direct-DB routes
```

The 11 remaining tournament-area routes belong to later groups:

- participants/rosters;
- live/general match administration;
- incidents;
- sponsors;
- family lookup.

## Certification

Added:

```bash
npm run api:tournament-core:check
```

The command verifies:

- converted routes contain no `db.*`/`prisma.*`;
- converted routes use shared API setup;
- services do not import the database directly;
- repository owns Prisma access;
- fixture transaction and operation-lock boundaries exist;
- key scheduling invariants remain present;
- schemas are centralized.

The main preflight now includes this check.

Current dependency-free certification:

```text
Production preflight         PASS
15/15 certification tests   PASS
341 source files parsed      PASS
Syntax failures              0
Unresolved local imports     0
```

## Database

No Prisma schema change was introduced in this architecture pass.

The fixture/knockout commit path reuses the existing `TournamentProgressionLock` collection for short-lived operation locks.

Because fixture commits now use Prisma transactions, the production MongoDB deployment must support transactions/replica-set semantics, which is already required by other hardened application flows.
