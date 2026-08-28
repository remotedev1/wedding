# Professional Module 5 — Match Statistics & Commentary

## Goal
Turn scorer actions into a professional, auditable match-data stream and expose useful live statistics on the public Match Centre.

## Changes
- Added `SHOT`, `STAT_UPDATE` and `COMMENTARY` MatchEvent types.
- Added shared `lib/tournament/match-statistics.js` calculation engine.
- Added scorer actions for shots / shots on target and manual team statistics.
- Manual metrics currently support possession, circle entries, fouls and goalkeeper saves.
- Existing goals, cards, penalties, substitutions and shootout events contribute to calculated statistics.
- Added player impact statistics derived from match events.
- Added public Match Statistics scorecard.
- Added dedicated Official Commentary feed while preserving legacy NOTE commentary.
- MatchEvent now has an index on `[matchId, type]` for event/stat queries.

## Architecture
Scorer action -> protected match API -> MatchEvent timeline -> statistics calculator -> scorer/public scorecard.

This avoids introducing another embedded hockey-only statistics blob and keeps the event model expandable for future sports.

## Database
No data backfill is required. Prisma enum/index changes require `prisma generate` / `prisma db push` against the test database.

## Validation
Changed server JS files pass `node --check`. Changed scorer/public JSX files pass TypeScript transpile syntax validation.
