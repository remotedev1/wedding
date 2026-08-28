# Professional Match Engine Hardening

This pass turns live match control into an optimistic-concurrency, result-locking and idempotent tournament engine.

## Live scorer concurrency

Every live mutation now carries:

```text
actionId
expectedControlVersion
```

The server performs a compare-and-swap update:

```text
WHERE id = matchId
  AND controlVersion = expectedControlVersion
UPDATE ...
  controlVersion += 1
```

A stale scorer/device receives `409 MATCH_VERSION_CONFLICT`. The stale mutation is not applied.

The live client serializes its own outgoing mutations and automatically refreshes when another device wins a version race.

## Result integrity

Result-affecting actions increment `resultVersion`.

`END_MATCH` and `SET_WALKOVER` lock the result with `lockedAt`.

Fixture administration cannot directly set `COMPLETED`, `WALKOVER`, winner or draw fields. Those states must pass through match-result workflows.

Knockout matches cannot finish as draws. A tied knockout requires a shootout/explicit winner.

Winner names are derived from match participants instead of trusting client text.

Player of the match must belong to one of the participating families.

## Controlled result correction

Authorized match managers can use:

```text
/dashboard/tournaments/:tournamentId/matches/:matchId/result-correction
```

The correction workflow requires:

- completed/walkover result;
- exact current `resultVersion`;
- written reason of at least 10 characters;
- no already-generated downstream knockout fixture.

Reopening increments result/control versions, clears stale winner/draw flags, records the correction reason and unlocks the result for Match Control.

## Match event integrity

Normalized events use the committed `controlVersion` as their sequence rather than timestamp multiplication.

This avoids integer overflow/collision-prone sequence generation and ties each event to one authoritative match mutation.

`actionId` is recorded on the event for tracing/idempotency diagnostics.

## Knockout progression

`TournamentProgressionLock` provides one database-backed lock per generated bracket slot:

```text
tournament:event:SEMI_FINAL:1
tournament:event:SEMI_FINAL:2
tournament:event:FINAL:1
tournament:event:THIRD_PLACE:1
```

This prevents simultaneous quarter/semi-final completion requests on separate app instances from producing duplicate bracket fixtures.

Match-number allocation retries on database uniqueness races.

## State-machine hardening

Live control no longer permits arbitrary state changes.

Examples:

- scheduled/delayed matches use `START_MATCH`;
- completed/walkover states use dedicated result workflows;
- abandoned/no-result states cannot simply be resumed;
- shootout attempts require `PENALTY_SHOOTOUT`;
- hockey goal correction requires a live hockey match;
- clock reset is restricted to live/suspended matches.

## Existing bug removed

The legacy match DELETE handler contained copied live-update code referencing `isLiveUpdate` and `body` outside their scope. That dead/invalid block has been removed.

## Database changes

This pass adds:

```prisma
Matches.controlVersion Int @default(0)
MatchEvent.actionId String?
TournamentProgressionLock
```

The existing `scripts/backfill-live-match-engine.cjs` now also initializes missing `controlVersion` and `resultVersion` values for legacy match documents.

Run the backfill immediately after applying the Prisma schema update and before starting the application.

## Certification commands

```bash
npm run check:architecture
npm run security:core:check
npm run transaction:core:check
npm run match:engine:check
```
