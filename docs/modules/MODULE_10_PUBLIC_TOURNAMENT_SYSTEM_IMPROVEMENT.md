# Module 10 — Public Tournament System Improvement

## Objective
Turn the public website into a reliable extension of the tournament-control system instead of a separate static/demo experience.

## Canonical public data layer
Added `lib/tournament/public.js` as the server-side public projection for the current published tournament. It derives only safe public information from the tournament database:

- active/current tournament metadata
- event/game list and public counts
- live matches
- upcoming fixtures
- completed results
- pool standings
- knockout fixtures
- sponsors
- final placements

Added `GET /api/public/tournaments/current` for the live client refresh path. It returns the same canonical projection rather than maintaining a second score model.

## Public website redesign
The homepage now follows a simpler operational hierarchy:

1. Tournament identity/status/dates
2. Tournament at a glance
3. Live matches or next fixtures
4. Official recent results
5. Podium/honours when published
6. Chenanda family story

Removed the old hard-coded countdown, mock live-score carousel, mock venue cards, static schedule and unused payment banner.

## Tournament Center
Added `/tournament` with:

- live/next-match board
- upcoming schedule
- pool standings
- knockout progression
- completed results
- placements

The public standings use the same standings calculation introduced for the admin tournament workflow.

## Live score behaviour
`TournamentLiveBoard` starts from a server-rendered snapshot and refreshes `/api/public/tournaments/current` every 15 seconds while the page is open. It also refreshes when the browser tab becomes visible again.

No fake viewer count and no fake Socket.IO connection are shown.

## Navigation
Rebuilt the public header with real routes:

- Home
- Tournament
- Live Scores
- Registration
- Gallery
- About
- Staff login

Added desktop and mobile active states and removed the old placeholder `#` links.

The footer now uses real internal navigation rather than non-functional links/social placeholders.

## Auth pattern consistency
The remaining News POST API was moved away from direct `auth()` destructuring and now uses the canonical API handler + permission model.

The change-password API now uses `requireAuth()` from the canonical auth authorization module.

Remaining direct `auth()` calls are limited to auth/session plumbing where session resolution is the responsibility of that layer (root session provider, canonical auth helpers and logout revocation).

## Cleanup
Removed obsolete public components that had no remaining consumers:

- `components/frontEnd/homepage/EventCountdown.jsx`
- `components/frontEnd/homepage/Hero.jsx`
- `components/frontEnd/homepage/LiveScoreCarousel.jsx`
- `components/frontEnd/homepage/MatchSchedule.jsx`
- `components/frontEnd/homepage/PhotoPortfolio.jsx`
- `components/frontEnd/homepage/sponsorsList.jsx`
- `components/frontEnd/homepage/venueDetails.jsx`
- `components/frontEnd/payment.jsx`
- `lib/Transition.jsx`

Removed empty legacy directories:

- `app/api/payments/[paymentId]/manual-complete`
- `app/auth/email-verification`

Removed dependencies that became unused after the cleanup:

- `html-to-image`
- `swiper`
- `react-icons`
- `react-transition-group`

Aligned `eslint-config-next` with the Next.js 14.2 line.

## Self-contained ZIP improvement
Earlier module ZIPs no longer contained the original `public/fonts` directory but `app/layout.js` still hard-required those font files with `next/font/local`. That hidden build dependency was removed. The UI now uses a safe system sans-serif fallback while retaining the existing `font-mundial` utility name.

OpenGraph metadata was also changed so it no longer points to missing packaged image/favicon assets.

## Validation performed
- all local `@/` imports scanned: 0 unresolved
- `package.json`: valid JSON
- repository JavaScript syntax check: pass
- changed JSX/JSX-like files parsed using TypeScript `--noResolve`: pass
- removed component references: 0

## No database migration
Module 10 does not change the Prisma schema.

## Recommended local validation
```bash
npm install
npx prisma generate
npx prisma validate
npm run build
```

Then test:

1. open `/` with an ONGOING tournament
2. verify live/next matches match dashboard data
3. open `/tournament`
4. verify standings against completed pool results
5. verify knockout fixtures against admin bracket
6. finish a match in admin and confirm public update within ~15 seconds
7. test mobile navigation and tournament tables
8. test `/score-hockey`
9. test REGISTRATION tournament CTA
10. test no-active-tournament fallback

## Recommended next module
Module 11 should focus on Family / Player / Roster Operations: event-specific roster eligibility, captain/manager contacts, jersey validation, roster locking at tournament start, player transfer/duplicate safeguards, printable team sheets and scorer-friendly lineups.
