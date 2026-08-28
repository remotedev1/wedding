# Module 14 — Expandable Tournament Domain v2 & Sports Portal

## Objective

Move the application from a tournament-specific CRUD model toward an expandable sports platform while preserving the working hockey workflows. The public experience is reorganized around live match data, schedules, standings and match centres rather than static marketing sections.

## Domain architecture changes

### Tournament identity and publishing

`Tournament` now supports:

- `shortName`
- `slug`
- `timezone`
- `visibility` (`PRIVATE`, `UNLISTED`, `PUBLIC`)
- `publishedAt`
- dynamic venues
- normalized competition stages

Operational lifecycle (`DRAFT`, `REGISTRATION`, `UPCOMING`, etc.) is separated from public visibility.

### Expandable event configuration

`TournamentGame` remains the event boundary for backward compatibility, but now also supports:

- short name / event code / slug
- registration fee in minor currency units
- configurable currency
- match duration and minimum rest
- on-field team size
- minimum/maximum roster sizes
- points configuration
- tie-break configuration
- scoring/rules JSON configuration
- normalized stages and placements

This allows different tournament editions and events to use different competition rules without adding another global enum each time.

### Dynamic venues

Fixed `Venues` Prisma enums were removed. `TournamentVenue` stores real grounds with name, short name, address, coordinates, capacity, timezone, active state and ordering. Matches retain a legacy/display `venue` string while optionally linking to `venueId` during the transition.

### Stages and groups

Fixed Pool A-H assumptions were removed from Prisma. Competition structure can now use:

- `TournamentStage`
- `StageGroup`
- arbitrary group codes
- round-robin, league, Swiss, knockout, qualifier, placement or custom stage types

Existing pool/round strings remain as compatibility fields while APIs gradually move to normalized stage IDs.

### Standings snapshots

`StandingRow` provides a future-safe place to publish/materialize competition tables. Current standings calculation can continue dynamically until snapshot publication is intentionally enabled.

### Match architecture

`Matches` now supports:

- normalized venue/stage/group links
- publication status
- duration and clock fields
- result version / locking
- normalized event timeline
- match officials

Existing embedded hockey/football/cricket score blobs remain temporarily for compatibility.

### Match event timeline

`MatchEvent` is the expandable live-data stream. New live hockey actions append normalized events such as:

- match start/end
- status changes
- goals / own goals
- shootout attempts
- score corrections
- notes

The model already has extensible event types for cards, substitutions, penalties, wickets, runs, timeouts, injuries and other sports. This enables a Cricbuzz-style chronological match centre without remodeling the entire Match document for every new sport.

### Match officials

`MatchOfficial` normalizes referees, umpires, scorers, timekeepers and tournament officials per fixture.

### Money model

Legacy Float amounts remain for compatibility, but new transaction paths populate integer minor-unit fields:

- `TournamentGame.registrationFeeMinor`
- `GameRegistration.paymentAmountMinor`
- `Payment.amountMinor`
- `Payment.refundAmountMinor`

`PaymentAllocation` normalizes how one payment settles one or more event registrations.

### Placements

Placements are now event-aware (`gameId`) instead of assuming a sport can only have one category per tournament. Legacy records can be backfilled automatically when a tournament has exactly one matching event for that sport.

## Public sports portal improvements

The public experience now follows a dense, data-first sports portal pattern rather than copying another brand's visual identity.

### Header

Compact sports masthead with direct navigation to:

- matches
- live scores
- standings
- knockout
- registration
- gallery

### Tournament centre

The public tournament centre prioritizes:

- live and next fixtures
- event navigation
- schedule
- standings
- knockout rounds
- latest results
- honours

### Public match centre

New route:

`/tournament/matches/[matchId]`

It displays:

- participants and score
- live/final status
- date and venue
- event/tournament context
- chronological event timeline
- player of the match
- match officials

Legacy hockey goals are used as a fallback timeline when older matches do not yet have normalized `MatchEvent` rows.

## Admin improvements

Tournament setup now exposes:

- full and short names
- edition year
- tournament timezone
- start/end dates
- registration deadline
- operational status
- public visibility

A dedicated venue manager was added at:

`/dashboard/tournaments/[tournamentId]/venues`

Event setup now includes match duration, minimum rest, team size and roster bounds.

## Backfill

Run after the new Prisma schema has been generated/applied:

```bash
npm run db:migrate-domain-v2
```

The script backfills:

- tournament/game/family/player slugs
- tournament publication defaults
- dynamic venues from legacy match venue strings
- event fee values in paise/minor units
- default event duration/rest/ranking config
- pool and knockout stages
- stage groups from legacy pool codes
- registration/match group links
- payment minor-unit values
- event-aware legacy placements when unambiguous
- payment allocations from legacy `registrationIds`
- legacy field-hockey goals into `MatchEvent`

## Compatibility strategy

This is intentionally not a destructive rewrite. Legacy fields remain where active APIs still consume them. New normalized structures are written alongside them, allowing future modules to migrate consumers progressively without putting current tournament operations at unnecessary risk.

## Validation performed

- all application `.js` / `.cjs` files: syntax pass
- all `.jsx` / `.tsx` files: parser/transpile pass
- local `@/` imports: zero unresolved imports
- no fixed Prisma `Pool` or `Venues` enum remains
- no backup/copy artifacts remain
- no new runtime dependency introduced specifically for the domain redesign

A full Prisma/database/build validation still must be run locally because dependencies/database access are not available in this packaging environment.
