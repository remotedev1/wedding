# Production Certification

This repository now has a layered certification workflow instead of a single ambiguous `test` command.

## Commands

### Dependency-free preflight

```bash
npm run certify:preflight
```

Runs:

- src architecture guard
- security-core guard
- registration/payment transaction invariants
- professional match-engine invariants
- staff/officials invariants
- admin-operations invariants
- public-data boundary invariants
- source-hygiene scan
- Node built-in certification tests

This can run before installing Prisma dependencies.

### Prisma/schema certification

```bash
npm install
npx prisma generate
npm run certify:static
```

`certify:static` includes `prisma validate`.

### Read-only database integrity certification

```bash
npm run certify:db
```

Requires `DATABASE_URL`.

The database audit is read-only and checks:

- duplicate tournament/event registrations;
- paid/processing registration payment linkage;
- confirmed-registration timestamps;
- payment/allocation reconciliation;
- Razorpay completion integrity;
- refund bounds;
- completed match result locks/versioning;
- knockout winner integrity;
- clock consistency;
- match event sequence/action-id duplicates;
- match official overlapping assignments;
- stale progression locks;
- expired session cleanup warnings.

### Running-server HTTP security smoke test

```bash
CERT_BASE_URL=http://localhost:3000 npm run certify:http
```

Checks:

- homepage availability;
- CSP and baseline security headers;
- public tournament endpoint;
- cross-origin mutation rejection;
- oversized reset-request rejection.

### Full environment certification

With the app already running:

```bash
CERT_BASE_URL=http://localhost:3000 npm run certify:all
```

This includes static, Prisma, DB and HTTP checks.

## Built-in tests

The project intentionally uses Node's built-in `node:test` for the core certification suite, so no Jest/Vitest dependency was added.

Current tests cover:

- role/permission matrix;
- scorer vs fixture-manager separation;
- protected route permissions;
- safe redirect behavior;
- same-origin mutation enforcement;
- public fixture publication boundary;
- public official privacy projection;
- registration uniqueness;
- payment claim-before-gateway invariant;
- authoritative gateway verification;
- match optimistic concurrency/result locking;
- match-scoped scorer assignment;
- official conflict checks.

## Cleanup completed

The certification pass removed unused legacy common components:

- `CardSkeleton.jsx`
- `CustomDropDown.jsx`
- `CustomSelect.jsx`
- `Drawer.jsx`
- `Heading.jsx`
- `Loader.jsx`
- `RadioCard.jsx`
- `back-button.jsx`
- `form-error.jsx`
- `form-success.jsx`
- legacy `components/common/header.jsx`

No used component was removed.

## Remaining architecture debt

Certification currently reports a warning for API route handlers that still perform direct database work.

Critical transaction/security domains already use service/repository boundaries:

- guest registration;
- payment creation/verification;
- match mutation/concurrency;
- result correction;
- officials/staff assignment.

Tournament core routes have now been migrated. Older participants/rosters, families/players, users, content/operations and auth routes still need to be migrated to the same Crafty-style:

```text
route
  -> validation
  -> authorization
  -> service
  -> repository
  -> database
```

This warning does not fail preflight because those routes are currently protected and functional, but the project should not be described as **fully architecture-complete** until that migration is finished.

## Production decision

A green `certify:preflight` proves code-level invariants.

A production-ready decision additionally requires all of these on the deployment/staging environment:

1. `npx prisma validate`
2. schema/backfills applied successfully
3. `npm run certify:db`
4. `npm run build`
5. application started successfully
6. `npm run certify:http`
7. backup/restore and deployment rollback procedure verified

Do not treat static certification alone as proof that the real database or deployment environment is healthy.
