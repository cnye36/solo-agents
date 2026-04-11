# AGENTS.md

This file is for coding agents working in `/data/apps/solo-agents`.

## Repo Summary

`solo-agents` is a `pnpm` monorepo with:

- `apps/web`: Next.js 16.2.3 App Router frontend for the single-assistant UX
- `apps/api`: Hono-based backend/BFF that fronts the existing AffinityBots platform
- `packages/config`: shared product copy, nav items, and integration TODO constants
- `packages/types`: shared DTOs and domain types
- `packages/ui`: small shared UI package placeholder

The current product name in code is `Northstar Assistant`. The app is intentionally scaffolded around an existing backend/runtime rather than replacing it.

## Non-Negotiable Next.js Rule

This repo uses `next@16.2.3`, which has behavior changes relative to older Next.js versions.

Before changing code under `apps/web`, read the relevant docs in the installed Next.js docs bundle:

- `node_modules/.pnpm/next@16.2.3_@babel+core@7.29.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/docs/`
- fallback path that also exists in this repo: `node_modules/.ignored/next/dist/docs/`

At minimum, consult the relevant guide when touching routing, layouts, proxying, data fetching, caching, or server/client component boundaries.

Files that were especially relevant while inspecting this repo:

- `01-app/01-getting-started/02-project-structure.md`
- `01-app/01-getting-started/05-server-and-client-components.md`
- `01-app/02-guides/upgrading/version-16.md`

Important implications for this repo:

- `next dev` and `next build` use Turbopack by default in Next 16
- `proxy.ts` is the correct convention here, not legacy `middleware.ts`
- App Router rules matter: layouts/pages are Server Components by default
- Keep `"use client"` scoped narrowly to interactive leaves

## Workspace Commands

Run commands from the repo root unless there is a reason not to.

- Install: `pnpm install`
- Web dev: `pnpm dev:web`
- API dev: `pnpm dev:api`
- Build all: `pnpm build`
- Lint configured packages: `pnpm lint`
- Typecheck all workspaces: `pnpm typecheck`

Package-level commands:

- Web typecheck: `pnpm --filter @solo-agents/web typecheck`
- API typecheck: `pnpm --filter @solo-agents/api typecheck`

Current quality-state caveats:

- `apps/api` lint script is a placeholder and does not lint anything meaningful yet
- `packages/ui`, `packages/types`, and `packages/config` have placeholder lint scripts
- there are no obvious test suites in the repo today, so typecheck/build are the main verification paths

## Architecture And Boundaries

### Frontend

The frontend is App Router based and uses route groups:

- `app/(marketing)` for the public landing page
- `app/(auth)` for login/signup
- `app/(app)` for authenticated product routes

Key conventions already in use:

- root layout in `apps/web/app/layout.tsx`
- authenticated shell layout in `apps/web/app/(app)/layout.tsx`
- auth/session refresh handled in `apps/web/proxy.ts`
- Supabase SSR helpers live under `apps/web/src/lib/supabase`
- server-side API calls to the BFF live under `apps/web/src/lib/api`
- view-level feature code lives under `apps/web/src/features`
- reusable shell/UI components live under `apps/web/src/components`

Prefer these patterns:

- keep pages/layouts server-first unless interactivity is required
- put fetches close to the server boundary
- let feature components consume typed data rather than building ad hoc response shapes inline
- keep route-group intent intact instead of flattening everything into `app/`

### Backend

The API is a small Hono service in `apps/api`.

Key entrypoints:

- `apps/api/src/index.ts`: service setup and route mounting
- `apps/api/src/routes/*`: HTTP route handlers
- `apps/api/src/lib/env.ts`: env parsing
- `apps/api/src/lib/auth.ts`: bearer-token auth lookup
- `apps/api/src/clients/*`: platform clients
- `apps/api/src/services/platform-data.ts`: Supabase-backed data assembly

Backend intent:

- act as a thin BFF over existing AffinityBots/LangGraph/Supabase infrastructure
- preserve auth separation between browser-safe keys and privileged server access
- keep route handlers narrow and push integration logic into service/client layers

### Shared Packages

Use shared packages instead of duplicating contracts or product constants:

- `@solo-agents/types` for DTOs and shared types
- `@solo-agents/config` for app-level constants, nav items, copy, and TODO strings

If a type is needed by both `apps/web` and `apps/api`, it belongs in `packages/types`.

## Environment Rules

Respect the frontend/backend secret boundary.

Frontend-safe values belong in `apps/web/.env.local` or `apps/web/.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_URL`

Backend-only values belong in `apps/api/.env`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URI`
- `LANGGRAPH_API_URL`
- `LANGSMITH_API_KEY`
- other provider or billing secrets

Important:

- do not move private secrets into the web app
- `apps/api/src/lib/env.ts` currently expects Supabase URL and anon key too, so keep that duplication in mind when changing config loading
- preserve `.env.example` files when adding new env vars

## Code Conventions Observed In This Repo

- TypeScript throughout
- ESM in the API and packages
- absolute imports via `@/` inside apps
- workspace package imports via `@solo-agents/*`
- double quotes and semicolons
- Tailwind CSS v4 in the web app
- shared CSS variables defined in `apps/web/app/globals.css`

Follow the existing style rather than introducing a new one.

### UI Guidelines For This Repo

The current UI direction is premium, dark, and product-marketing oriented. Existing files use:

- large radii
- layered dark surfaces
- muted slate copy
- violet accent tokens

Do not replace that with generic white-card SaaS styling unless the task explicitly calls for a redesign. Extend the token system in `globals.css` when possible instead of scattering hardcoded color choices.

### Data And Placeholder Patterns

Some flows are still scaffolded and intentionally return placeholders or fallbacks:

- `apps/web/src/lib/api/services/bootstrap-service.ts`
- `packages/config/src/index.ts` via `API_TODOS`

When implementing live integrations:

- prefer replacing placeholder data behind the existing typed interface
- do not rip out the scaffold unless the task requires it
- preserve the “thin BFF over existing platform” architecture

## File-Specific Guidance

### `apps/web/proxy.ts`

- This is the request proxy for auth/session refresh
- do not rename it to `middleware.ts`
- be careful when changing the matcher because it controls auth behavior for the whole app

### `apps/web/src/lib/supabase/*`

- `server.ts` is for server-side SSR client creation
- `proxy.ts` is for cookie/session refresh during proxy execution
- `client.ts` should remain browser-safe

Do not import server-only helpers into client components.

### `apps/web/app/(app)/layout.tsx`

- this layout enforces authentication server-side
- preserve redirect behavior for unauthenticated users unless the task is explicitly about auth flow changes

### `apps/api/src/services/platform-data.ts`

- this is a central aggregator for assistant, thread, file, integration, billing, and preference data
- keep this layer typed and incremental
- avoid embedding large Supabase queries directly in route handlers if they belong here

### `packages/config/src/index.ts`

- holds product copy and nav configuration
- update shared copy/constants here instead of scattering literals around the apps

## Change Strategy

When making changes:

1. Identify whether the change belongs in `apps/web`, `apps/api`, or a shared package.
2. If it affects shared contracts, update `packages/types` first.
3. If frontend and backend both use the same response shape, keep the shared type canonical.
4. Verify auth and env boundaries before adding any new integration code.
5. For web changes, check the relevant Next 16 docs before using framework APIs.

Prefer small, composable changes over broad rewrites.

## Verification Expectations

After code changes, run the narrowest meaningful checks first, then broader ones if needed:

- package-specific `typecheck` for touched packages
- `pnpm lint` if web files were touched or lint config changed
- `pnpm build` when the change is broad or affects cross-package integration

If you cannot run a check, say so explicitly.

## Things To Avoid

- do not assume older Next.js behavior without checking the installed docs
- do not introduce Pages Router conventions into the web app
- do not expose backend secrets to the browser
- do not bypass shared types/config by duplicating contracts in each app
- do not turn the API into a fat rewrite of the existing platform
- do not remove the current scaffold/fallback behavior casually
- do not depend on `next lint`; this repo uses ESLint CLI directly

## Good First Places To Read

If you need orientation before changing code, read these first:

- `README.md`
- `package.json`
- `apps/web/package.json`
- `apps/api/package.json`
- `apps/web/app/layout.tsx`
- `apps/web/app/(app)/layout.tsx`
- `apps/web/proxy.ts`
- `apps/web/src/lib/api/services/bootstrap-service.ts`
- `apps/api/src/index.ts`
- `apps/api/src/services/platform-data.ts`
- `packages/config/src/index.ts`
- `packages/types/src/index.ts`
