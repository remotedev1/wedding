# Module 11 — Family, Player & Team Roster Operations

## What changed

- Added event-specific roster snapshots to `GameRegistration`.
- Added captain, goalkeeper, team manager name/phone, and roster lock metadata.
- Added a protected roster API under each tournament participation/game registration.
- Added a professional roster manager to Registration Control.
- Roster edits are blocked once any match for that event has started.
- Live scoring now uses the submitted event roster instead of every active family player.
- Removed the unsafe live-score "add player" shortcut.
- Goal recording validates the selected player against the submitted event roster when one exists.
- Added jersey number collision checks when creating/updating players and when submitting a roster.
- Player deletion is blocked when that player appears in a submitted event roster.
- Fixed the dynamic player route parameter (`[players]`) and removed stale Prisma relation assumptions around embedded achievements.
- Expanded player sport validation/UI to the complete Prisma `SportType` enum, including `FIELD_HOCKEY`.
- Fixed the player list hook response/pagination contract.
- Match responses now include match-day `familyData.players` based on the event roster, with safe fallback to active family players for legacy registrations.

## Database update

This module adds fields to `GameRegistration` and a MongoDB composite type `RosterMember`.

For an existing database, use this order on a demo/test DB first:

```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run db:backfill-rosters
npm run build
```

The backfill command writes `roster: []` to existing `GameRegistration` documents that predate Module 11. This avoids leaving historical documents without the new required roster list.

## Recommended functional test

1. Create two active players in one family and confirm jersey duplication is rejected.
2. Register the family for a hockey event.
3. Open Registration Control → Roster.
4. Select players, captain, goalkeeper and manager details.
5. Save and reopen the roster.
6. Open the live match control and confirm only rostered players are shown.
7. Start the event's first match.
8. Reopen the roster and confirm it is locked.
9. Try recording a goal for a player not in the submitted roster; the API should reject it.
10. Try deleting a rostered player; the API should reject it.
