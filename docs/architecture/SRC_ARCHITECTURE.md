# Source Architecture Rewrite

The application runtime now lives entirely under `src/`.

## Root responsibilities

The repository root is reserved for infrastructure and project tooling:

```text
prisma/
scripts/
docs/
package.json
next.config.mjs
tailwind.config.js
postcss.config.js
jsconfig.json
Dockerfile
```

There is no root-level `app/`, `components/`, `lib/`, `hooks/`, `schemas/`, `auth.js`, or `middleware.js`.

## Runtime layout

```text
src/
├── app/                       # Next.js App Router only
│   ├── (client)/              # public routes
│   ├── (protected)/           # authenticated staff pages
│   └── api/                   # route handlers
│
├── auth.js                    # single Auth.js configuration
├── middleware.js              # headers/request metadata only
│
├── components/                # genuinely reusable UI
│   ├── ui/
│   ├── common/
│   └── providers/
│
├── modules/
│   ├── admin/
│   │   └── components/
│   ├── auth/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── server/
│   ├── families/
│   ├── matches/
│   │   ├── hooks/
│   │   └── schemas/
│   ├── operations/
│   ├── payments/
│   ├── players/
│   ├── public/
│   │   └── components/
│   ├── registrations/
│   ├── tournaments/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── server/
│   │   └── utils/
│   └── users/
│
├── hooks/                     # cross-feature browser hooks only
└── lib/                       # shared infrastructure only
    ├── api/
    ├── rate-limit/
    ├── db.js
    ├── mail.js
    └── utils.js
```

## Rules

1. `src/app` owns routing, metadata, layouts and HTTP route-handler boundaries. It should not become the business-logic layer.
2. Module-specific server/domain logic belongs inside `src/modules/<feature>/server`.
3. Module-specific React components belong inside that feature, not `src/components`.
4. `src/components` is reserved for reusable primitives and shared application UI.
5. `src/lib` contains infrastructure that is genuinely cross-feature: database, API response helpers, rate limiting, email and generic utilities.
6. Authentication has one source of truth: `src/lib/auth.js` plus `src/modules/auth/server/*`.
7. `@/` resolves to `src/`; imports should never reach back to root runtime folders.
8. Prisma and data-maintenance scripts stay at repository root because they are build/infrastructure concerns.
9. New modules should extend a module folder instead of creating another root-level runtime directory.
10. Do not reintroduce dead generic boilerplate APIs/pages unless they belong to the tournament product.

## Migration notes

The existing business behavior was retained while runtime ownership was rewritten. Clearly broken legacy category/consultation boilerplate was removed because it depended on schemas that did not exist.

All active pages and API handlers now resolve through `src/app`, and all active feature imports resolve through the new feature boundaries.
