# Registration & Payment Transaction Hardening

This pass converts the most sensitive public transaction chain to the Crafty-style module flow.

## Flow

```text
route
  -> security / rate limit
  -> validation
  -> module service
  -> repository / conditional DB mutation
  -> payment gateway
  -> verified reconciliation
```

## Guest registration

- Server owns tournament/event eligibility and canonical fee.
- `@@unique([gameId, participationId])` is the final duplicate-registration guarantee.
- P2002 uniqueness races are handled as an existing-registration result instead of a 500.
- Existing unpaid registrations return a resume-payment path rather than creating another registration.
- Free entries complete financially without creating a payment object.

## Order creation

The old pattern created the Razorpay order before securely claiming the registration. Two concurrent requests could therefore create two external orders.

The new flow is:

```text
load outstanding registration
 -> create local PROCESSING payment intent
 -> conditional updateMany claim:
      paymentStatus=PENDING
      paymentId=null
 -> require claimed count == obligation count
 -> create allocations
 -> create Razorpay order
 -> attach orderId
```

Only one concurrent request can claim the same registration. A losing request removes its unused local intent and returns a conflict.

If the process dies before a Razorpay order is created, a stale local intent can be recovered after the configured short recovery interval.

## Payment verification

A browser callback is not trusted merely because it contains Razorpay fields.

Completion requires:

1. valid HMAC callback signature;
2. local order exists;
3. Razorpay payment is fetched server-to-server;
4. Razorpay `order_id` matches;
5. gateway amount equals the local minor-unit obligation;
6. currency matches;
7. gateway payment state is `captured`.

Invalid signature attempts do **not** change payment or registration state.

Completion uses a conditional status update, making repeated verify calls idempotent.

## Webhooks

Webhook HMAC verification remains authoritative.

Captured/paid events call the same payment-completion module logic. Duplicate captured events are idempotent.

`payment.failed` is recorded as a failed attempt but does not release the registration or create a second order. Razorpay orders may be retried, so the existing order remains the single checkout boundary.

## Admin confirmation

Single and bulk staff confirmation now call the same registration service and shared readiness engine.

A registration cannot be confirmed until payment/roster/manager/captain readiness passes.

## Commands

```bash
npm run security:core:check
npm run transaction:core:check
npm run check:architecture
```

No new Prisma schema change is introduced by this transaction pass beyond the previously added security-core `AbuseRateLimit` model.
