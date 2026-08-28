# Module 09 — Standings, Knockout Progression & Auth Cleanup

## Tournament progression
- Added server-calculated pool standings for completed pool-stage matches.
- Ranking order: points, goal difference, goals for, wins, family name.
- Added standings API: `/api/tournaments/:tournamentId/standings?gameId=...`.
- Added admin standings/qualification panel to the tournament matches screen.
- Added preview/commit knockout generation for 2-pool (semi-final) and 4-pool (quarter-final) events.
- Knockout generation only uses completed pool stages and the top two teams from each pool.
- Added automatic progression:
  - 4 completed quarter-finals -> 2 semi-finals.
  - 2 completed semi-finals -> final + third-place fixture.
  - Progression is idempotent and does not create a duplicate next round.
- Source matches are linked to generated next matches through `nextMatchId`/`previousMatches`.

## Single auth / authorization pattern
The old parallel CASL authorization path has been removed. The project now follows the boilerplate pattern:

`NextAuth canonical session -> server-backed session validation -> explicit permission strings -> server policy checks`

- Removed `auth.config.js`; provider setup and callbacks now live in the single root `auth.js` configuration.
- Middleware no longer creates a second Auth.js instance. It is security/header middleware only, matching the boilerplate architecture.
- Dashboard/page protection remains server-side using `lib/auth/session.js`.
- API authorization uses the hardened session through `setupApiHandler` plus explicit permissions.
- Removed `@casl/ability` and `@casl/react`.
- Removed the old `lib/ability.js`, `hooks/useAbility.js`, `lib/auth.js`, and stale route-auth config.
- UI `Can` checks now consume the same permission strings as the server through `components/auth/can.jsx` and `lib/auth/resource-authorization.js`.

## Cleanup
Removed clearly dead or broken leftovers with no active consumers:
- `Registration.text`
- `MODULE_02_VERIFY.txt`
- `components/frontEnd/about/aboutComponent copy.js`
- `components/frontEnd/homepage/LiveScoreCarousel;.jsx`
- `components/backOffice/tournament/matches/sms.js`
- `context/dummy.provider.js`
- empty `components/frontEnd/tournament/index.jsx`
- empty `components/frontEnd/news/page.jsx`
- empty `app/api/projects/[id]/archive/route.js`
- unused `ThemeToggle`, `card-wrapper`, and navigation search components with missing dependencies
- stale `routes.js`
- stale `auth.config.js`

Removed dependencies with no code usage:
- `drizzle-orm`
- `react-multi-carousel`
- `react-use`
- `react-spinners`
- `d3-hierarchy`
- `uuid`
- `socket`
- `rate-limiter-flexible`
- `@auth/prisma-adapter`
- `dotenv`
- CASL packages

The inherited package lock was effectively empty/broken, so it was removed. Run `npm install` to generate a correct lockfile from the cleaned package manifest.

## Validation performed
- All changed/non-JSX API and library JavaScript files pass `node --check`.
- Local `@/` import resolution was checked after cleanup.
- No CASL/useAbility/auth.config/routes.js references remain in active source.
- No new database schema changes are required in this module.

## Local verification
```bash
npm install
npx prisma generate
npx prisma validate
npm run build
```

Recommended functional test:
1. Complete every pool fixture for an event.
2. Open Fixtures & Matches and inspect pool standings.
3. Preview knockout generation.
4. Commit knockout fixtures.
5. Complete all quarter-finals; verify semi-finals are created once.
6. Complete both semi-finals; verify Final and Third Place are created once.
7. Verify SCORER can score matches but cannot generate fixtures/brackets.
8. Verify an unauthorized dashboard/API request is rejected by server page/API authorization.
