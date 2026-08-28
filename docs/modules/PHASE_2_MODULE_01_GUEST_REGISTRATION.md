# Professional Phase — Module 1: Guest Registration & Payment Entry

## Objective
Make public tournament registration intentionally account-free and transactionally simple:

`Select family -> select one event -> create unique registration -> pay`

Staff/admin authentication remains unchanged and continues to use the hardened boilerplate auth/session/permission architecture.

## Changes

### Public registration no longer uses authentication
Removed the tournament-registration OTP and verification endpoints. Public tournament entry no longer creates a User, password, session, or temporary account.

### One event per checkout
Each submission registers one family for one TournamentGame. This gives each public action a clear transaction boundary and maps cleanly to one event fee/payment.

### Duplicate registration is authoritative
`GameRegistration` retains `@@unique([gameId, participationId])`. The API also pre-checks existing entries and returns `409 ALREADY_REGISTERED` for a duplicate. The database constraint remains the final guard against concurrent/double-click attempts.

### Resume payment instead of re-registering
When an existing registration has an outstanding fee, public registration context returns a fresh short-lived signed payment URL for that exact existing registration. The UI displays `Already registered` and `Resume outstanding payment` rather than permitting another entry.

### Paid/free entries stay locked
If payment is complete (or the event is free), the event is simply marked `Already registered`; no second entry can be created.

### Server-owned fees
The UI displays official event fees, but the registration API reloads the TournamentGame and calculates `paymentAmountMinor` from server data. The client never supplies the charge amount.

### Guest participation
`TournamentParticipation.registeredBy` is now nullable so public registration does not require inventing a User record. Guest entries use `registeredVia: WEB`.

### Auth cleanup
The old tournament-registration token helper was removed. Account-registration OTP hashing now lives under `lib/auth/otp.js`, keeping auth utilities inside the canonical auth boundary.

## Public flow
1. Open `/tournament-registration`.
2. Search/select a family.
3. Server loads event availability for that family.
4. Existing events show `Already registered`.
5. Select one available event.
6. POST `{ familyId, gameId }`.
7. Server validates tournament/event/deadlines and duplicate status.
8. Server creates/reuses TournamentParticipation and creates exactly one GameRegistration.
9. Paid event: redirect directly to `/secure/payment?token=...`.
10. Free event: show completion.

## Security notes
- No public login/session required.
- No password or OTP involved in tournament entry.
- Rate limiting remains enabled on public registration APIs.
- Payment tokens are HMAC-signed and scoped to participation/tournament/family/registration ID.
- Razorpay amount is still calculated server-side from the registration.
- A public user can pay an outstanding family registration but cannot alter its amount or mark it paid without successful provider verification.

## Schema change
`TournamentParticipation.registeredBy` changed from `String` to `String?` to support genuine guest registrations.

Run on the demo/test DB first:

```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run build
```

## Manual acceptance flow
- Select Family A -> Event X -> register -> payment opens.
- Close checkout.
- Return to registration -> Family A -> Event X shows Already registered + Resume payment.
- Attempt POST again -> 409, no duplicate row.
- Complete payment -> Event X remains Already registered and no resume-payment action is needed.
- Family A can still register separately for Event Y.
- Family B can register independently for Event X.
