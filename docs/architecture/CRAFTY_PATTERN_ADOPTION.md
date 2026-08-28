# Crafty Pattern Adoption

The hockey platform now follows the structural pattern used by Crafty.

## Pattern

```text
src/
├── app/          # Next.js routing and HTTP boundaries
├── components/   # shared UI primitives only
├── config/       # site/env/navigation configuration
├── lib/          # cross-module infrastructure
├── modules/      # business domains
└── middleware.js
```

## Hockey modules

- `modules/admin` — admin shell/navigation/content-only admin concerns
- `modules/auth` — auth actions, UI, hooks, policies/permissions and auth repositories
- `modules/tournaments` — tournament domain, scheduling, standings, knockout, public/admin tournament UI
- `modules/matches` — match-specific hooks/schemas
- `modules/registrations` — guest registration access/readiness/public registration UI
- `modules/payments` — payment infrastructure and admin payment UI
- `modules/families` — family hooks/admin UI
- `modules/players` — player eligibility/hooks
- `modules/users` — user administration UI/hooks
- `modules/operations` — operational notifications
- `modules/public` — site-wide public chrome/content that is not owned by another business module

## Crafty conventions adopted

- Thin App Router boundary.
- Business ownership under `src/modules/<domain>`.
- Centralized `src/config`.
- Shared infrastructure under `src/lib`.
- Shared UI only under `src/components`.
- Canonical auth configuration in `src/lib/auth.js`.
- Central admin navigation config.
- `@/*` resolves exclusively to `src/*`.
- Architecture guard prevents root runtime folders from returning.

The hockey code keeps NextAuth/Auth.js and its MongoDB/Prisma tournament model. Crafty's business logic and Better Auth implementation were not copied.
