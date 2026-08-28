# Public Sports Portal v3

This pass upgrades the spectator side into an operations-backed sports portal.

## Added

- Cricbuzz-style live/next score ticker on the homepage and Tournament Centre.
- 15-second score refresh with visibility-aware refresh.
- Published-fixture boundary: public snapshots only include `publicationStatus=PUBLISHED`.
- Public match/event counts are calculated from published matches, not internal fixture totals.
- Public officials projection exposes only role/name for active/completed public-safe assignments.
- Tournament match browser mobile density improvements.
- Dynamic SEO/OpenGraph metadata for public match pages.
- Route-level loading skeletons for the public shell, tournament centre and match centre.
- Public header now consumes centralized `siteConfig.publicNavigation`.
- Existing match centre, event centre, standings, team/player profiles and official statistics remain grounded in the same authoritative tournament data.

## Public data principle

The public portal never determines competitive truth. It only projects tournament data that has passed through the admin/scoring/result workflows and is explicitly published.

## Database

No Prisma schema change in this public UX pass.
