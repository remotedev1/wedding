# Crafty Core Security Replication — Hockey Platform

This pass ports the core security architecture used by the Crafty reference into the hockey platform while retaining Hockey's Auth.js/NextAuth, Prisma/MongoDB domain and tournament-specific authorization.

## Implemented

- Canonical route/API policy registry.
- Existing resource authorization retained for tournament-specific permission nuance.
- Shared Prisma/MongoDB-backed `AbuseRateLimit`.
- Login rate limiting plus account-specific failed-login lockout.
- Trusted-proxy-aware client IP handling.
- Same-origin browser mutation protection in `setupApiHandler`.
- Bounded JSON request parsing.
- Bounded Razorpay webhook raw body.
- Razorpay HMAC signature verification retained.
- 12–128 character password policy for registration/change/reset.
- Password change/reset revokes active DB sessions and increments `authVersion`.
- Structured JSON logger.
- Common secret/token/password redaction.
- Safe local redirect helper.
- Content Security Policy, HSTS, clickjacking/MIME/referrer/opener/resource/permissions headers.
- Request IDs and no-store caching for private/API routes.
- ImageKit private key removed from all `NEXT_PUBLIC_*` names.
- ImageKit upload authentication and delete endpoints require authorized content access.
- Legacy unguarded blog/news/family-tree mutation endpoints moved behind the common API security path.
- Public comment and password-reset endpoints use shared rate limiting and bounded payloads.
- Security static certification command: `npm run security:core:check`.

## Intentional exceptions

`/api/razorpay/webhook` does not use browser same-origin enforcement because Razorpay is an external provider. The endpoint is protected by HMAC signature verification and a strict raw-body size limit.

## Database change

A new MongoDB model is required:

```prisma
model AbuseRateLimit {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  key         String   @unique
  count       Int      @default(0)
  resetAt     DateTime
  lockedUntil DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([resetAt])
  @@index([lockedUntil])
}
```

Apply first to the demo/test database:

```bash
npx prisma generate
npx prisma validate
npx prisma db push
npm run security:core:check
npm run build
```

## Static validation completed in this pass

- Security core static check: PASS
- src architecture check: PASS
- 325 JS/JSX/TS/TSX source files parsed: 0 syntax failures
- unresolved local imports: 0
- mutation routes reviewed: 53
- unguarded browser mutation routes: 0 (Razorpay webhook is an intentional provider-signed exception)
