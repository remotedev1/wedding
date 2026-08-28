# Module 05 — Fixtures & Live Match Control Hardening

## Objective
Make the tournament-day match workflow deterministic, permission-safe, and usable without relying on an undeclared realtime backend.

## Implemented

### Fixture integrity
- Match creation now requires two different families.
- Both families must already participate in the tournament.
- When a tournament game/event is selected, both families must have CONFIRMED registration for that game.
- Prevents duplicate match number per tournament/sport (existing database rule plus API validation).
- Prevents two matches from using the same venue at the exact same scheduled start time.
- Prevents a family being scheduled in two matches at the exact same scheduled start time.
- The same venue/team conflict checks also run when a fixture date/time or venue is edited.

### Live hockey operations
The protected match PATCH route now implements the actions already exposed by the control UI:
- START_MATCH
- END_MATCH
- SET_PERIOD
- SET_STATUS
- SET_WINNER
- SET_DRAW
- SET_MAN_OF_MATCH
- ADD_NOTE
- ADD_HOCKEY_GOAL
- DELETE_HOCKEY_GOAL
- ADD_SHOOTOUT
- DELETE_SHOOTOUT
- SET_WALKOVER
- ADD_PLAYER

Goal writes validate that the selected player is active, belongs to the selected family, and that the family is actually participating in the match.

### Result finalization
- A match must be LIVE or SUSPENDED before it can be ended.
- Field-hockey winners are derived from regulation goals when scores differ.
- If regulation is tied, shootout totals determine the winner when they differ.
- Pool/early-round ties can complete as draws.
- Knockout matches cannot complete tied without a winner.
- Walkovers automatically end the match and assign the opposing family as winner.
- Completed matches reject further live-control actions.

### Permission separation
- SCORER continues to have Match UPDATE/SCORE access for live operations.
- SCORER can no longer use the same endpoint to modify fixture configuration.
- ADMIN/SUPER_ADMIN retain fixture-management authority through the existing ability system.

### Live synchronization
The repository contained socket.io-client but no Socket.IO server. The previous live controller therefore attempted to connect to a backend that did not exist in this project.

Module 5 removes socket.io-client and uses:
- immediate server response after each mutation,
- optimistic UI with rollback,
- 10-second refresh polling while the page is visible,
- an immediate refresh when the browser/tab becomes visible again.

This is intentionally simple and deployable on ordinary Next.js hosting. A true SSE/WebSocket service can be added later if concurrent scorer/public-display latency justifies it.

### Existing defects fixed
- Live mutation hook expected `result.data.data` even though the shared API helper returns `{ success, data }`; it now reads `result.data`.
- Removed invalid Prisma relation-style `include`/`_count` usage on the embedded `participants` composite field.
- Fixed winner marker in match cards to compare `winnerId` with participant `familyId`.
- Removed the unused socket.io-client dependency and refreshed package-lock.json.

## Validation performed
- `node --check` passes for modified JavaScript hook/API files.
- package.json/package-lock.json were refreshed after dependency removal.
- No database schema migration was required by this module.

## Recommended local certification
```bash
npm install
npx prisma generate
npx prisma validate
npm run build
```
Then test a real tournament flow using demo data:
1. Register two families in the tournament.
2. Confirm both for a hockey game.
3. Schedule a fixture.
4. Verify venue/team slot conflict rejection.
5. Start the fixture as SCORER.
6. Add/remove goals.
7. Run a shootout on a tied knockout match.
8. Complete the match and verify winner/draw.
9. Confirm scoring is locked after completion.
10. Confirm SCORER cannot edit fixture configuration.
