# Phase 2 · Module 06 — Tournament & Player Statistics Engine

## Goal
Turn the official match-event stream into trustworthy tournament-wide statistics without creating duplicate counters.

## Added
- Public `/tournament/stats` sports-portal page.
- Tournament-wide team/family form: P/W/D/L, GF/GA/GD, clean sheets, win rate and last-five form.
- Player leaderboards for goals, shots on target and discipline.
- Event-level completed-match and goals-per-match summaries.
- Statistics navigation from the public header and Tournament Centre.
- Pure `calculateTournamentStatistics()` domain function so the aggregation logic is reusable later by admin dashboards/API caching.

## Data integrity
Player leaderboards use only official recorded `MatchEvent` data. Historical matches that lack player-level events are not guessed. Team scores continue to use canonical participant score records for compatibility.

## Architecture
Matches + MatchEvent -> statistics calculator -> public statistics projection -> responsive portal UI.

No Prisma schema change and no new runtime dependency are required for this module.

## Next
Module 7 should add player/family profile pages and richer tournament discovery/search, using these statistics as the profile data source.
