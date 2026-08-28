# Module 01 — Authentication & Authorization Hardening

This module adapts the supplied authentication boilerplate's security model to the existing hockey tournament application without changing the application's MongoDB database or forcing a Next.js major-version migration.

## Implemented

- Server-backed authentication sessions while retaining JWT transport.
- Immediate session invalidation support through `authVersion`, blocked/inactive account checks, revoked sessions and expiry checks.
- Login failure tracking and 15-minute account lockout after 5 failed password attempts.
- Seven-day authentication sessions.
- Login activity records for successful and failed credential authentication.
- Canonical role-to-permission map for the existing hockey roles: SUPER_ADMIN, ADMIN, MODERATOR, SCORER, FAMILY, USER.
- Session now carries role, roles, permissions, sessionId and invalidation state.
- Email/password login retained.
- Phone/password login retained and moved onto the same hardened credential/session flow.
- Fixed the old `verifyAdminAccess()` implementation that treated a NextAuth session as a user object.
- Expanded CASL resources to cover users, families, players, tournament games, sponsors, content, payments and settings.
- Removed invalid `ORGANIZER` authorization behavior and aligned CASL with the Prisma UserRole enum.
- Fixed login Zod `safeParse` handling so invalid input is checked before destructuring `.data`.
- Fixed phone-login equivalent validation bug and an undefined logging variable.
- Fixed alternate phone registration storage so phone numbers remain strings rather than integers.

## Prisma schema additions

The `User` model now includes:

- `authVersion`
- `failedLoginAttempts`
- `lockedUntil`
- `sessions`

A new `Session` model stores revocation/expiry metadata.

Because the project uses MongoDB, deploy this schema using the normal MongoDB Prisma workflow for this project (normally `prisma db push`, not a relational migration workflow).

## Important validation

JavaScript syntax validation passed for all modified files.

A complete `npm ci` did not finish within the execution environment timeout, so full build/runtime certification remains to be run locally.

Recommended local validation:

```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run build
```

Review the schema changes before `db push` against production data. Back up production data first.

## Next module

Module 02 should standardize and secure the tournament API layer:

- canonical route structure
- per-operation permissions
- consistent request validation
- consistent response/errors
- sponsor authorization restoration
- scorer-specific match permissions
- remove duplicate `game` / `games` API implementations only after usage tracing
