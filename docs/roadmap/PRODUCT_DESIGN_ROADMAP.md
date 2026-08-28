# Product & Design Roadmap

## Product direction
The platform should feel like a professional live-sports portal: fast to scan, trustworthy, mobile-first and data-led. It should not copy another site's visual identity. Tournament branding remains distinct while the information architecture follows proven sports-product patterns.

## Design principles
1. Live information first: score, clock, status and next action are always highest priority.
2. Dense but readable: compact match rows and statistics on desktop, stacked cards on mobile.
3. One source of truth: admin/scorer actions feed public scorecards, standings and statistics.
4. Operational clarity: destructive/corrective controls are separated from routine scoring.
5. Permission-aware UI: staff only see controls they can actually use.
6. Progressive disclosure: summary first, details/timeline/officials/analytics one level deeper.
7. Fast public pages: server-rendered initial state, lightweight refresh while live.
8. Accessible interactions: keyboard focus, reduced motion, touch targets and clear status text.

## Roadmap
### Module 5 — Match Statistics & Commentary
- Team match statistics
- Player impact statistics
- Structured official commentary
- Shots / shots on target
- Penalty-corner and card statistics derived from timeline
- Manual auditable metrics such as possession, circle entries, fouls and saves
- Public match statistics scorecard

### Module 6 — Tournament & Player Statistics
- Top scorers
- Player appearances
- Cards / disciplinary leaders
- Team/family form
- Goals for/against
- Clean sheets when goalkeeper data is available
- Tournament records and event leaderboards

### Module 7 — Sports Portal Navigation & Discovery
- Matches by date/event/status
- Search families, players and matches
- Event landing pages
- Team/family pages
- Player pages
- Venue pages
- Previous/next match navigation

### Module 8 — Live Experience Polish
- Match-centre tabs/sections
- Sticky mobile score header
- Commentary filters
- Timeline event icons
- Match summary
- Shareable deep links
- Better live refresh behavior and connection state

### Module 9 — Admin Operations Finalization
- Fast scorer mode
- Match correction workflow
- Result approval
- Fixture reschedule workflow
- Roster approval queue
- Bulk tournament operations
- Audit inspection tools

### Module 10 — Content & Tournament Presentation
- News/editorial integration
- Sponsors
- Tournament stories/history
- Gallery
- Venue/visitor information
- SEO and social metadata

### Final Phase — Certification & Production
- Unit/integration tests
- Database-backed transaction tests
- Auth/RBAC security tests
- Registration/payment tests
- Live scoring and progression tests
- Playwright E2E
- Accessibility checks
- Performance and bundle audit
- Backup/restore rehearsal
- Production deployment hardening


## Module 6 delivered
Tournament/player statistics engine: public leaderboards, family form, event scoring summaries, and official event-derived player metrics.


## Module 7 delivered
Public team/family and player profiles, team/player directories, privacy-safe public projections, bounded public search, and cross-linking from tournament statistics into the sports directory.


## Module 8 delivered
Sports-portal browsing UX: compact live strip, tournament-timezone match browser, status/date filters, dedicated event pages and simplified primary navigation.


## Professional match engine hardening
Live scoring now uses optimistic concurrency (`controlVersion`), action IDs, result locking/versioning, explicit result correction, deterministic event sequencing, strict match-state transitions, and database-backed idempotent knockout progression locks.
