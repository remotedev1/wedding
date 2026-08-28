# Module 02 — Tournament API & Permission Hardening

## Goal
Make tournament-control APIs use the hardened authentication session from Module 01 consistently, remove permission bypasses, repair broken route contracts, and keep existing UI behavior compatible.

## Canonical routes
- Tournaments: `/api/tournaments`, `/api/tournaments/:tournamentId`
- Tournament games: `/api/tournaments/games`, `/api/tournaments/games/:gamesId`
- Tournament matches: `/api/tournaments/:tournamentId/matches`, `/api/tournaments/:tournamentId/matches/:matchesId`
- Sponsors: `/api/tournaments/sponsors`, `/api/tournaments/sponsors/:sponsorId`
- Families: `/api/families`, `/api/families/:familyId`
- Players: `/api/families/players`, `/api/families/players/:playerId`
- Users: `/api/users`, `/api/users/:id`

## Security changes
- Core APIs now use the normalized authenticated user returned by `setupApiHandler()` rather than calling `auth()` a second time with inconsistent session shapes.
- Tournament creation uses the Tournament permission rather than SUPER_ADMIN-only `manage all` logic.
- Match creation now explicitly checks `CREATE Match` permission.
- Sponsor CREATE and UPDATE authorization has been restored.
- Legacy tournament game/match routes have also been moved onto the normalized session so they cannot bypass the hardened auth layer while retained for compatibility.

## API contract fixes
- Fixed `gamesId` route parameter handling in `/api/tournaments/games/[gamesId]`.
- Fixed `matchesId` route parameter handling in `/api/tournaments/[tournamentId]/matches/[matchesId]`.
- Single-match reads/writes now verify that the match belongs to the tournament in the URL.
- Match creation derives `tournamentId` from the URL instead of trusting a client-supplied tournament ID.
- Match listing is scoped to the URL tournament.
- Tournament game and match list responses now expose predictable `{ games, pagination }` and `{ matches, pagination }` payloads.
- Pagination parsing now safely handles invalid, zero, and negative values.

## Admin hook fixes
- `useGame` previously called the non-existent `/api/tournament-games` endpoint. It now uses `/api/tournaments/games`.
- `useGame` now reads the canonical response shape.
- `useMatch` now reads the canonical response shape.
- `useUpdateMatch` now accepts a `tournamentId` and calls the real scoped route.
- `useDeleteMatch` now accepts a `tournamentId`.
- `useLiveMatchControl` now accepts both `tournamentId` and `matchId` rather than referencing an undefined `tournamentId`.

## Role consistency
The user API and back-office user form/table now use only Prisma-supported roles:
- SUPER_ADMIN
- ADMIN
- MODERATOR
- SCORER
- FAMILY
- USER

The invalid legacy `MANAGER` role was removed from these flows.

## User API correction
The User `Address` field is a Prisma MongoDB composite type, not a related model. User creation now writes the composite directly and its validation shape matches the Prisma type.

## Intentionally deferred
- Razorpay amount derivation, payment verification, webhook/idempotency work is reserved for the dedicated Payment Hardening module.
- Legacy `/api/tournaments/game*` and unscoped `/api/tournaments/matches*` routes remain temporarily for compatibility. They are hardened, but should be removed after E2E coverage confirms no external consumer depends on them.
- Full route-contract automated tests are planned in the testing module.

## Validation performed
- `node --check` passed for all tournament/family/user API JavaScript files changed in this module.
- `node --check` passed for `hooks/useGame.js` and `hooks/useMatch.js`.
- No remaining direct `await auth()` calls exist in tournament/family/user API routes.
- No remaining `MANAGER` references exist under app/lib/hooks/components.

A full Next.js build still requires local dependencies and the target MongoDB environment; this module is not falsely marked build-certified without that run.
