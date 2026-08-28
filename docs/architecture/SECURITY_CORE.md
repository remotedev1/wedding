# Hockey Security Core — Crafty Pattern

The hockey platform now uses the same layered security flow as the Crafty reference while retaining Hockey's Auth.js/NextAuth and MongoDB domain.

## Request flow

```text
Request
  -> request id / security headers / CSP
  -> same-origin mutation check (browser mutations)
  -> canonical Auth.js session
  -> shared Prisma-backed rate limit
  -> API policy / resource permission
  -> validation + bounded body
  -> module/service/database work
  -> activity/audit logging
  -> redacted structured error logging
```

Razorpay webhook is intentionally exempt from browser-origin enforcement. It uses HMAC signature verification and a bounded raw body.

## Authentication

- Credentials and phone credentials use the canonical Auth.js configuration in `src/lib/auth.js`.
- Database session records are checked on JWT refresh.
- Blocked/inactive accounts and `authVersion` invalidation revoke access.
- Password change/reset increments `authVersion` and revokes active DB sessions.
- New/reset passwords are 12–128 characters.
- Login attempts use the shared rate limiter in addition to account-specific failed-login lockout.
- Forwarded client IP headers are trusted only when `TRUST_PROXY=1`.

## Authorization

- `src/modules/auth/authorization/policy-registry.js` classifies protected dashboard routes and common API action families.
- Existing resource authorization remains authoritative for tournament objects.
- Protected dashboard pages are fail-closed in the security static check if a route is not classified.
- Admin navigation consumes the same permission catalogue.

## CSRF / origin protection

`setupApiHandler()` rejects unsafe cross-origin browser mutations by default using `Origin`, `Sec-Fetch-Site`, configured app origin, and trusted proxy settings.

## API rate limiting

`AbuseRateLimit` is stored in MongoDB through Prisma so rate limits survive process restarts and are shared across application instances.

Presets exist for auth, reset, public registration, payment, public APIs, authenticated APIs, admin APIs and live scoring.

## Request safety

- `readJsonRequest()` defaults to a bounded JSON payload.
- Selected upload/webhook routes have explicit larger bounded limits.
- Safe redirect helper blocks protocol-relative, external and control-character redirects.
- Structured logs redact common password/token/secret fields.

## HTTP security

Middleware sets CSP, HSTS in production, frame denial, MIME sniffing protection, referrer policy, opener/resource policies, Permissions Policy, request IDs and no-store caching for private/API paths.

## Integrity command

```bash
npm run security:core:check
```

The static check verifies protected route policy coverage, mutation-route security setup, absence of public secret env names, trusted proxy handling, CSP presence, shared auth rate limiting and the Prisma abuse-limit model.
