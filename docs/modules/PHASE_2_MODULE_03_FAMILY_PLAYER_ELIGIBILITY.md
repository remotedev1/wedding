# Professional Module 3 — Family, Player & Registration Eligibility

## Goal
Make family/player data trustworthy enough to drive guest registration and official event rosters without introducing family login.

## Domain changes
- `TournamentGame`: `minAge`, `maxAge`, `eligibilityCutoffDate`, `allowedGenders`.
- `Families`: representative/contact fields and operational `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- `Player`: normalized identity name, gender, verification status/note and optional photo URL.

## Shared eligibility engine
`lib/eligibility.js` is the single rule engine for guest and staff roster updates. It checks active status, rejected player records, date-of-birth requirements, age boundaries and allowed gender rules. Age is calculated at the configured eligibility cutoff or the event date.

## Duplicate safeguards
Player names are normalized for case/whitespace before duplicate checks. Existing exact-name checks are retained as compatibility fallback. Jersey uniqueness remains enforced for active players within a family.

## Public registration
Only active families appear in the guest family picker. Registration completion also checks the family status server-side so direct API requests cannot register suspended/inactive families.

## Roster UX
Guest team entry and admin roster management receive eligibility results per player. Ineligible players are visibly disabled with the exact reason, and both PATCH APIs enforce the same rules again server-side.

## Event setup
Admins can configure minimum/maximum age, eligibility cutoff date and allowed genders directly in the event form. Empty gender selection means open eligibility.

## Family/player API repair
The old family detail route was updated to the actual Domain v2 schema and its `[familyid]` parameter. It no longer queries removed fields/relations from the pre-redesign model.

## Migration
Run after `prisma db push`:

```bash
npm run db:backfill-directory-eligibility
```

The script backfills existing families to `ACTIVE`, existing events to an open gender list, normalized player names, and legacy player verification to `UNVERIFIED` (never falsely `VERIFIED`).

## Recommended local validation
```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run db:backfill-directory-eligibility
npm run build
```
