# Module 07 — Payment Transaction Hardening

## Goal
Make tournament registration payments server-authoritative and operationally recoverable without changing the tournament domain or adding a new payment dependency.

## Main changes
- Replaced the hard-coded `/secure/payment` demo with a registration-linked Razorpay checkout.
- Registration completion now issues a signed 24-hour payment token containing only the participation/family/tournament scope and eligible GameRegistration IDs.
- `/api/razorpay/create-order` no longer accepts amount/currency/event details from the browser. It derives all payable registrations and the exact INR total from MongoDB.
- Added internal Payment creation before checkout and links GameRegistration records to the Payment while processing.
- Added duplicate-order protection: an in-progress payment order is reused rather than creating a second order for the same registrations.
- Added `/api/razorpay/verify-payment` with HMAC signature verification and idempotent reconciliation.
- Added `/api/razorpay/webhook` so captured/failed provider events can reconcile even when the browser callback is interrupted.
- Added `registrationIds` to Payment and made gateway `orderId` unique for direct reconciliation.
- Added admin `/dashboard/payments` control center with collected/outstanding totals, payment ledger, offline payment recording and reconciliation.
- Added `/api/payments/manual` for administrator-recorded CASH/UPI/BANK_TRANSFER/etc. payments. The server prevents mixing families/tournaments in one payment.
- Added `/api/payments/[paymentId]/reconcile` for safe repair of registration payment flags from a completed Payment.
- Fixed tournament overview logic that incorrectly tested for a nonexistent `PAID` status; Prisma uses `COMPLETED`.
- Added Razorpay environment placeholders, including a separate webhook secret.

## Payment invariants
1. The client never chooses the amount.
2. A payment is tied to explicit GameRegistration IDs.
3. The server recalculates payable registrations before creating an order.
4. Completed registration fees are not charged again.
5. A processing order is reused rather than duplicated.
6. Razorpay success is accepted only after signature verification or a signed webhook.
7. Verification/reconciliation is safe to retry.
8. Manual payments require PAYMENT manage permission and can only settle one family/tournament at a time.
9. `TournamentParticipation.totalAmountPaid` is recalculated from completed registrations after settlement.

## Environment
Required for Razorpay checkout:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_WEBHOOK_SECRET`

Configure Razorpay to POST webhooks to:
`/api/razorpay/webhook`

Recommended events:
- `payment.captured`
- `payment.failed`
- `order.paid`

## Prisma update
`Payment` now contains:
- `orderId String? @unique`
- `registrationIds String[] @default([])`

Run against a demo/test database first:
```bash
npm install
npx prisma generate
npx prisma validate
npx prisma db push
npm run build
```

## Validation performed here
- `node --check` passed for all changed non-JSX API/payment helper files.
- JSX files transpiled successfully with the available TypeScript compiler.
- Changed local `@/` imports resolve.
- Full Prisma/build certification could not be performed because dependencies are not installed in this execution environment; `npx` failed before invoking Prisma with `npm error must provide string spec`.

## Recommended transaction test
1. Register a family for two paid events.
2. Open the generated secure payment link.
3. Verify total equals the sum stored in both TournamentGame records.
4. Click Pay twice and confirm only one active order is reused.
5. Complete Razorpay test payment.
6. Confirm Payment is COMPLETED and both GameRegistration rows are COMPLETED with the same paymentId.
7. Refresh/retry verify/reconcile and confirm no duplicate charge/payment is created.
8. Record an offline payment for another family and verify the ledger/participation total.
9. Attempt to record one offline payment for registrations from two families; server must reject it.
10. Trigger/submit a failed payment and confirm registrations return to PENDING.
