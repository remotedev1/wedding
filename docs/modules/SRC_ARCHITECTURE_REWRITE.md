# Source Architecture Rewrite

This pass resets the codebase around a strict `src/` application boundary.

## Completed

- Moved all Next.js routes and API handlers to `src/app`.
- Moved the canonical Auth.js config to `src/lib/auth.js`.
- Moved middleware to `src/middleware.js`.
- Split reusable UI (`src/components`) from feature-owned UI/server code (`src/modules`).
- Moved admin UI to `src/modules/admin/components`.
- Moved public sports UI to `src/modules/public/components`.
- Consolidated auth actions/components/hooks/schemas/server logic under `src/modules/auth`.
- Consolidated tournament domain/server/hooks/schemas/utilities under `src/modules/tournaments`.
- Consolidated match hooks/schemas under `src/modules/matches`.
- Consolidated registration/payment/operations/player/family/user feature code.
- Updated `@/*` to resolve to `./src/*`.
- Updated Tailwind and shadcn config paths for `src`.
- Enabled React Strict Mode.
- Removed broken category/consultation boilerplate and unrelated construction-project dashboard code.
- Added `npm run check:architecture` to prevent regression to root-level runtime folders.

## Validation

- Repository-wide JS/JSX syntax parsing.
- Local alias and relative import resolution.
- No root `app`, `components`, `lib`, `hooks`, `schemas`, `actions`, `helpers`, `utils`, `context`, `auth.js`, or `middleware.js`.
- No legacy import prefixes from the old root structure.

This is an architectural rewrite. Prisma remains at repository root because it is infrastructure, not runtime application source.
