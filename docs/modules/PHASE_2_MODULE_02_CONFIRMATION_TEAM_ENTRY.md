# Professional Phase 2 — Module 02

## Registration Confirmation & Guest Team Entry

This module extends the no-login registration flow introduced in Module 01.

### Public flow

1. Family selects one event.
2. Server creates exactly one `GameRegistration` for the family/event pair.
3. The registration receives a human-readable official reference.
4. Paid events continue to Razorpay; free events continue directly to confirmation.
5. Successful payment returns to `/registration/confirmation?access=...`.
6. The signed access link is scoped to one registration and expires after 30 days.
7. The family representative can submit manager/contact information and the event roster without an account.
8. Tournament approval remains separate from payment completion and is controlled by staff.

### Security properties

- Guest access is HMAC signed with `AUTH_SECRET`/`NEXTAUTH_SECRET`.
- The token is scoped to registration, participation, tournament and family IDs.
- Team entry is blocked until payment is completed for paid events.
- Team entry becomes read-only after competition starts.
- Player IDs are server-validated against active players in the selected family.
- Captain/goalkeeper must belong to the submitted roster.
- Duplicate jersey numbers are rejected.
- Existing family/event uniqueness remains enforced by Prisma `@@unique([gameId, participationId])`.
- Staff authentication remains on the canonical hardened auth system and is not mixed into guest registration.

### Registration reference

`GameRegistration.registrationReference` was added. New public and admin-created event registrations receive a reference built from tournament code/year, event code and the unique registration ID suffix.

Historical registrations can be backfilled with:

```bash
npm run db:backfill-registration-references
```

### Payment behavior

The existing payment token remains short-lived and payment-specific. After payment, the app returns a separate guest registration access token. If a paid registration is already complete, the payment context can direct the user to the confirmation page rather than creating another order.

### Admin visibility

Registration Control now shows the official registration reference and identifies entries whose manager details and roster are ready for review.

### Database change

Added optional indexed field:

```prisma
registrationReference String?
@@index([registrationReference])
```

Run against the demo/test database first:

```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run db:backfill-registration-references
npm run build
```

### Manual acceptance flow

- Register Family A for Event X and confirm the official reference appears.
- Paid event: complete Razorpay and verify redirect to confirmation.
- Free event: verify direct redirect to confirmation.
- Verify payment status and tournament approval are shown separately.
- Submit manager name, manager phone, roster, captain and goalkeeper.
- Verify invalid/non-family players cannot be submitted by changing the request manually.
- Verify roster cannot be edited once the event has started.
- Verify admin Registration Control shows reference and team-sheet readiness.
- Verify a second Family A + Event X registration remains blocked.
