# Professional Module 4 — Live Match Engine

## Purpose
Upgrade the tournament-day scorer and public match experience into a server-authoritative live match engine while preserving existing hockey score compatibility.

## Key improvements

### Persisted match clock
`Matches` now stores `clockRunning`, `clockStartedAt`, `clockAccumulatedSeconds`, and `periodStartedAt`. The live scorer can run, pause, and explicitly reset the official match clock. Refreshing or changing devices no longer reconstructs the clock only from `actualStartTime`.

### Field hockey periods
The scorer UI now prioritizes Q1, Q2, half time, Q3, Q4, extra time, shootout, and full time. Existing half-based period enum values remain compatible for historical matches and other sports.

### Match event timeline
The normalized `MatchEvent` stream now records clock controls, cards, penalties, substitutions, scorer commentary, goals, shootout actions, notes, score corrections, and lifecycle changes. Embedded hockey goal/shootout structures remain as the compatibility/read-optimized score layer.

### Match-day integrity
Cards and substitutions are validated against the submitted event roster when one exists. A browser cannot submit arbitrary player IDs. Completed matches remain locked against scorer mutations.

### Permission boundary
Live actions use `matches.score`; fixture and official administration use `matches.manage`. This matches the boilerplate permission model and makes the SCORER role functional without granting fixture administration rights.

### Match officials
A protected officials endpoint supports adding/removing referee, assistant referee, umpire, scorer, timekeeper, match commissioner, technical official, and other officials. Changes are activity logged.

### Public Match Centre
Live public match pages now refresh every 15 seconds while operationally active, display the persisted clock, and render card/penalty/substitution/commentary timeline events alongside goals and other updates.

## Database upgrade
Run on the demo/test database first:

```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run db:backfill-live-match-engine
npm run build
```

The backfill initializes historical Matches documents with a paused clock and zero accumulated seconds when the new fields are absent.

## Recommended acceptance scenario
1. Start a scheduled field hockey match as ADMIN or SCORER.
2. Verify the clock starts and survives page refresh.
3. Pause the clock, refresh, and verify elapsed time does not advance.
4. Move Q1 → Q2 → half time → Q3 → Q4.
5. Record a goal using a submitted roster player.
6. Record green/yellow/red card events.
7. Record a penalty corner or penalty stroke event.
8. Record a substitution between two submitted roster players.
9. Add official match commentary.
10. Assign referee/timekeeper as an ADMIN; verify a SCORER cannot manage officials.
11. Open the public Match Centre and verify score, clock, timeline and officials.
12. Complete the match and confirm further scorer actions are rejected.
