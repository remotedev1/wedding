# Module 13 — Professional UI/UX & Responsive System Pass

## Goal
Standardize the active tournament application UI without changing business logic. This module focuses on system-wide hierarchy, responsive behavior, admin consistency, auth presentation, accessibility, and cleanup of inherited boilerplate styling.

## Key improvements

### Global design foundation
- Rebuilt `app/globals.css` into one coherent base layer.
- Removed duplicate resets and obsolete Swiper styles.
- Removed the global `p { max-width; margin }` rule that was leaking public-site typography into dashboard cards, dialogs and tables.
- Added complete light/dark shadcn CSS tokens.
- Added reusable `page-shell`, `page-header`, `page-eyebrow`, `page-title`, `page-description`, `surface-card`, `metric-card`, and `responsive-table-wrap` primitives.
- Improved focus-visible behavior, minimum viewport handling, image defaults, text wrapping and reduced-motion support.

### Dashboard shell
- Admin header is now sticky with a restrained translucent backdrop.
- Removed client scroll listeners/state from the header; no JS is needed just to style scroll state.
- Standardized dashboard content spacing through `page-shell`.
- Refined mobile sidebar trigger sizing.
- Improved sidebar branding and collapsed-mode behavior.

### Navigation correctness
- Fixed collapsed sidebar dropdown navigation using `to=` on a Next.js `Link`; it now correctly uses `href=`.
- Retained permission-driven navigation from the boilerplate-style auth/session model.
- Removed the unused legacy `components/backOffice/data/sidebar-data.js` file and its old Projects/Testimonials navigation model.

### Authentication presentation
- Reworked auth layout into a focused staff-access surface.
- Removed the missing `/logo-red.png` dependency from the login screen.
- Login now visually communicates that it is protected tournament administration.
- Email/phone tabs, primary action and supporting text use the same neutral professional system as the admin console.
- Business auth/session behavior remains unchanged.

### Shared states
- Fixed `EmptyState` contrast: its heading was hard-coded white even on a white/light surface.
- Empty states now use the same rounded surface/card language as the rest of the admin.
- Rebuilt the generic `Heading` helper around the common page typography primitives.

### Tournament admin
- Removed inherited orange-only tournament page branding.
- Tournament list now uses the same neutral admin hierarchy as operations/payments/control screens.
- Create Tournament remains the clear primary action.

### Payments
- Removed duplicate page padding inside Payment Control (the dashboard shell already owns page spacing).
- Standardized finance page heading.
- Added reusable responsive table wrappers for outstanding payments and ledger tables.

## Responsive principles used
- 320px minimum supported layout width.
- Mobile page padding: 16px.
- Tablet: 24px.
- Desktop: 32px.
- Wide admin content remains capped at 1600px.
- Wide operational tables scroll inside their own container instead of forcing page-level horizontal overflow.
- Primary headers stack on small screens and move to horizontal action layouts on larger screens.

## Files notably changed
- `app/globals.css`
- `app/auth/layout.jsx`
- `components/backOffice/auth/login-form.jsx`
- `components/backOffice/navigation/dashboard-shell.jsx`
- `components/backOffice/navigation/header.jsx`
- `components/backOffice/navigation/sidebar.jsx`
- `components/backOffice/navigation/nav-group.jsx`
- `components/backOffice/tournament/TournamentMain.jsx`
- `components/backOffice/payments/payment-control.jsx`
- `components/common/EmptyState.jsx`
- `components/common/Heading.jsx`

## Removed
- `components/backOffice/data/sidebar-data.js`
- now-empty `components/backOffice/data/` directory

## Validation
- Repository-wide JS/JSX parser check: PASS.
- Unresolved local `@/` imports: 0.
- No dependency was added.
- No Prisma schema change in this module.

## Local certification
Run:

```bash
npm install
npx prisma generate
npx prisma validate
npm run build
```

Recommended visual checks:
- `/auth/login` at 360px, 768px and desktop.
- `/dashboard` with sidebar expanded/collapsed and mobile drawer.
- `/dashboard/tournaments` empty and populated states.
- `/dashboard/payments` with wide ledger data on mobile.
- `/dashboard/operations` with many active alerts/incidents.
- public `/`, `/tournament`, `/score-hockey`, and `/tournament-registration` on mobile and wide desktop.

## Next recommended module
Module 14 should be automated test + certification hardening rather than another large feature pass: auth/RBAC, registration, payments, roster locking, scheduling conflicts, live scoring, standings, knockout progression and responsive E2E smoke flows.
