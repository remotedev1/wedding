# Module 06 — Registration & Team Entry Control

## Objective
Make tournament intake reliable from public phone verification through admin confirmation, without trusting client-side fees, deadlines, family ownership, or registration status.

## Implemented

### Public registration
- `/tournament-registration` now resolves the next tournament whose status is `REGISTRATION` and whose registration deadline has not passed.
- Added public registration context endpoint with active event availability.
- Added public family search endpoint for family selection.
- Added tournament-specific OTP send/verify endpoints.
- OTP values are HMAC-hashed before storage in `OtpVerification`.
- Successful OTP verification issues a short-lived signed registration token scoped to phone number + tournament.
- Removed the old attempt to auto-sign a tournament registrant into NextAuth without a password.
- Existing users cannot use the browser to switch away from a family already linked to their account.
- New tournament registrants are created as `FAMILY` users with a random unknown password; normal account recovery can be used later to establish credentials.
- Registration can add new event entries to an existing tournament participation without duplicating existing events.
- Server validates tournament status/deadline, event status/deadline, family existence and selected event ownership.
- Event fee is copied from `TournamentGame.registrationFee` on the server.
- Free events are marked payment-complete automatically; paid events begin `PENDING` for Module 07 settlement.

### Data model alignment
Restored fields already assumed by the existing UI/API but missing from Prisma:
- `Tournament.registrationDeadline DateTime?`
- `TournamentGame.registrationDeadline DateTime?`
- `TournamentGame.registrationFee Float @default(0)`

Game create/update API now persists these fields and validates that game dates fall inside tournament dates and registration deadlines occur before the event date.

### Admin registration control
The tournament Participants screen is now a registration operations queue:
- family/event counts
- confirmed/pending/payment-pending metrics
- active-player roster readiness indicator
- add family
- add event entry to an existing family participation
- per-entry status controls: pending, confirmed, waitlisted, rejected, cancelled
- pool assignment A–H
- bulk registration status updates
- CSV export including event, status, pool, payment and active-player count

Confirmation is rejected when the family has no active player records. This provides a minimum roster readiness gate without inventing sport-specific roster-size rules that the current data model does not contain.

### Auth cleanup completed
Removed unused broken legacy endpoints that depended on non-existent `User.phoneOtp` / `User.phoneOtpExpires` fields:
- `/api/auth/login/send-otp`
- `/api/auth/verify-otp`
- `/api/auth/register/family`

The canonical phone-registration OTP endpoints were retained and upgraded to hash OTPs and actually call the server-side SMS utility.

### SMS configuration
Twilio secrets now use server-only environment variables:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

No SMS secrets should use `NEXT_PUBLIC_` prefixes.

## Database migration required
The Prisma schema changed in this module. On the intended test/demo database run:

```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run build
```

Review/back up production data before `prisma db push`.

## Deferred to Module 07
Payment gateway settlement is intentionally not mixed into this module. Module 07 should make payment creation/verification idempotent and connect `Payment`, Razorpay orders, and `GameRegistration.paymentStatus` safely.
