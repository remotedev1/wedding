# Phase 2 · Module 07 — Player, Team Profiles & Tournament Discovery

## Goal
Turn tournament statistics into navigable public sports identities: teams/families, players, matches and events.

## Added
- `/teams` public family/team directory.
- `/teams/[slug]` public team profile with current players, form, recent published matches, tournament history and honours.
- `/players` public player directory.
- `/players/[slug]` public player profile with official event-derived goals, shots on target, cards, Player-of-the-Match awards and recent activity.
- `/search?q=` bounded public discovery across active teams, active/non-rejected players, public tournament events and published matches.
- Leaderboard rows now link to player profiles.
- Team-performance rows now link to team profiles.
- Header navigation now includes Teams and Search.

## Security / privacy
Public projections intentionally exclude:
- family phone/email/contact person
- registration references/tokens
- payment state or amounts
- manager phone
- verification notes
- exact player date of birth

Profiles only expose sporting/public identity and published tournament data.

## Data integrity
Player statistics are derived from official MatchEvent records. Historical player-level activity is not guessed.
Team form uses canonical completed-match scores.
Only PUBLIC tournaments and PUBLISHED matches are exposed.

## Compatibility
Slug routes safely distinguish MongoDB ObjectIds from human slugs before querying, preventing malformed ObjectId errors.

## Database
No Prisma schema change.
No new runtime dependency.

## Next
Module 8 should focus on sports-portal discovery and live UX: event landing pages, date-based match browsing, filters, compact score strips, richer global navigation and mobile-first live-following behavior.
