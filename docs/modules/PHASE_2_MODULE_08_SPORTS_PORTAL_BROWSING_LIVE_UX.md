# Phase 2 · Module 08 — Sports Portal Browsing & Live UX

## Goal
Improve spectator navigation so the public tournament site behaves like a professional live sports portal rather than one long information page.

## Added
- Compact live-score strip on the Tournament Centre.
- Date-aware match browser with All / Live / Upcoming / Results filters.
- Tournament-timezone-aware date grouping.
- Dedicated event pages at `/tournament/events/[eventId]`.
- Event pages include fixtures/results browsing, standings, confirmed teams, competition details and honours.
- Event cards in the Tournament Centre.
- Cleaner, lower-cognitive-load public header.
- Registration and Search are now actions rather than equal-weight navigation tabs.
- Primary navigation focuses on Matches, Live, Stats, Teams and Players.

## UX principles
- Live state is visible immediately.
- Match discovery is filter-first and date-first.
- Event detail is progressively disclosed instead of crowding the Tournament Centre.
- Desktop remains information-dense; mobile uses horizontally scrollable filters and compact rows.
- No decorative animation dependency was added.

## Data integrity
- Event pages expose only active events under PUBLIC tournaments.
- Only PUBLISHED, non-cancelled matches appear on event pages.
- Confirmed team registrations populate event team lists.
- Match date grouping uses the tournament's configured timezone.

## Architecture
Tournament snapshot
  -> compact live strip
  -> match browser
  -> event directory
  -> event landing page
  -> Match Centre / team profile / stats

## Database
No Prisma schema change.
No new runtime dependency.

## Next
Module 9 should refine live-following UX further: event/date deep links, current-day defaults, compact score navigation on match pages, related fixtures, previous/next match navigation and stronger mobile score presentation.
