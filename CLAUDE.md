# CLAUDE.md

This file is the primary instruction set for Claude Code working in `/data/apps/solo-agents`.

---

## What This Repo Is

`solo-agents` is a `pnpm` monorepo (pnpm@10.33.0). It builds **Northstar Assistant** — a premium, chat-first AI assistant product layered on top of an existing AffinityBots + LangGraph + Supabase backend rather than replacing it.

| Package | Path | Stack |
|---|---|---|
| `@solo-agents/web` | `apps/web` | Next.js 16.2.3, App Router, Tailwind v4 |
| `@solo-agents/api` | `apps/api` | Hono, Node, LangGraph SDK, Supabase |
| `@solo-agents/mobile` | `apps/mobile` | Expo 55, React Native 0.83, Expo Router |
| `@solo-agents/config` | `packages/config` | Shared product copy, nav, constants |
| `@solo-agents/types` | `packages/types` | Shared DTOs |
| `@solo-agents/ui` | `packages/ui` | Shared UI placeholder (minimal) |

---

## Commands

Always run from the repo root unless there is a specific reason not to.

```bash
pnpm install                                  # install all workspaces
pnpm dev:web                                  # Next.js dev server
pnpm dev:api                                  # Hono API dev server
pnpm dev:mobile                               # expo start
pnpm build                                    # build all packages
pnpm lint                                     # lint (web + api placeholder)
pnpm typecheck                                # typecheck all workspaces
pnpm --filter @solo-agents/web typecheck      # web only
pnpm --filter @solo-agents/api typecheck      # api only
pnpm --filter @solo-agents/mobile typecheck   # mobile only
```

**Quality state caveats:**
- `apps/api` lint is a no-op placeholder
- `packages/ui`, `packages/types`, `packages/config` lint are no-ops
- There are no test suites — typecheck + build are the primary verification paths
- Do not use `next lint` — this repo uses ESLint CLI directly

---

## Verification After Changes

Run the narrowest meaningful check first, then broader ones if needed:

```bash
pnpm --filter @solo-agents/<app> typecheck   # always start here
pnpm lint                                    # if web files or lint config changed
pnpm build                                   # if change is broad or cross-package
```

If you cannot run a check, say so explicitly — do not claim the code is correct without verifying.

---

## Architecture

### Web (`apps/web`)

Next.js 16 App Router. Route groups:

```
app/
  layout.tsx                        # root layout
  (marketing)/page.tsx              # public landing page
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  (app)/layout.tsx                  # authenticated shell — enforces auth server-side
  (app)/chat/page.tsx
  (app)/account/page.tsx
  (app)/history/page.tsx
  (app)/files/page.tsx
  (app)/preferences/page.tsx
  (app)/integrations/page.tsx
  (app)/integrations/[id]/page.tsx
  api/chat/route.ts
  api/integrations/catalog/route.ts
  api/integrations/catalog/[id]/route.ts
  api/integrations/connect/route.ts
```

Feature code in `src/features/` — one folder per domain. Server-side API calls via `src/lib/api/server.ts` (`apiServerRequest<T>`). Services per domain in `src/lib/api/services/`. Supabase SSR helpers in `src/lib/supabase/`.

**Key conventions:**
- Pages and layouts are Server Components by default — keep it that way
- `"use client"` is scoped narrowly to interactive leaves only
- `proxy.ts` handles session cookie refresh — do NOT rename to `middleware.ts`
- Do not import `src/lib/supabase/server.ts` into client components
- `app/(app)/layout.tsx` enforces auth — preserve its redirect behavior unless the task is explicitly about auth flow

### API (`apps/api`)

Hono service on port 4000. Thin BFF over Supabase + LangGraph:

```
src/
  index.ts              # route mounting: /health /bootstrap /assistant /threads /chat /files /integrations /account
  lib/env.ts            # typed env parsing
  lib/auth.ts           # requireUser(c) — validates Bearer token via Supabase
  clients/              # supabase-auth, supabase-admin, langgraph
  services/
    platform-data.ts    # ~900 LOC — central data aggregator for all domain data
    solo-workspace.ts   # ensureSoloWorkspaceId per user
  routes/               # one file per route group
```

**Key facts:**
- Default assistant: name `"Northstar Assistant"`, graph `"reactAgent"`, model `gpt-4.1`, memory limit 50
- MCP catalog is read from `apps/web/public/data/official-mcp-servers.json` (static file)
- Solo workspace uses `profiles.preferences.soloWorkspaceId` — **never** `activeWorkspaceId` for Solo routes
- `platform-data.ts` is the right place for Supabase queries — do not embed them directly in route handlers

### Mobile (`apps/mobile`)

Expo 55 / React Native 0.83 with Expo Router file-based navigation.

**App structure:**

```
app/
  _layout.tsx           # GestureHandlerRootView + SessionProvider
  index.tsx             # redirects to /(tabs)/chat or /(auth)/sign-in
  (auth)/_layout.tsx
  (auth)/sign-in.tsx
  (tabs)/_layout.tsx    # bottom tab bar — wraps AppDataProvider
  (tabs)/chat.tsx       # → features/chat/chat-screen.tsx
  (tabs)/tools.tsx      # → features/integrations/integrations-screen.tsx
  (tabs)/knowledge.tsx  # → features/files/files-screen.tsx
  (tabs)/more.tsx       # → features/more/more-screen.tsx
```

**Feature screens:**

```
features/
  auth/auth-screen.tsx
  chat/chat-screen.tsx          # full-screen chat, message bubbles, thread modal
  files/files-screen.tsx        # knowledge files list
  integrations/integrations-screen.tsx  # self-fetching, no props
  more/more-screen.tsx          # settings-style: memory, skills, account, sign out
```

**Providers:**

```
providers/
  session-provider.tsx      # SessionContext — auth state, signIn/signOut
  app-data-provider.tsx     # AppDataContext — bootstrap data shared across all tabs
```

`AppDataProvider` lives in `(tabs)/_layout.tsx` so bootstrap data is fetched **once** and shared. Consume it with `useAppDataContext()`. Do not call `useAppData()` directly inside tab screens.

**Key mobile patterns:**
- `SafeAreaView` from `react-native-safe-area-context` with explicit `edges` prop
- `KeyboardAvoidingView` with `behavior={Platform.OS === "ios" ? "padding" : "height"}` on input screens
- `Modal` with `presentationStyle="pageSheet"` for configuration/selection sheets
- Icons from `@expo/vector-icons` (Ionicons) — available without explicit install
- Design tokens in `src/constants/theme.ts` — import `colors`, `spacing`, `radii` — do not hardcode values

### Shared Packages

- **`@solo-agents/types`** — all shared DTOs: `AppBootstrapData`, `AssistantSummary`, `ThreadSummary`, `IntegrationCatalogItem`, `IntegrationDetail`, `KnowledgeFile`, `PreferenceGroup`, `NavItem`
- **`@solo-agents/config`** — `APP_NAME`, `APP_DESCRIPTION`, `APP_TAGLINE`, `NAV_ITEMS`, `API_TODOS`

If a type is used by more than one app, it belongs in `packages/types`. Update shared packages first before touching app code that depends on them.

---

## Environment Boundaries

**Web-safe** (`apps/web/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_APP_URL
```

**Mobile-safe** (`apps/mobile/.env`):
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_API_BASE_URL
```

**Backend-only** (`apps/api/.env`):
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URI
LANGGRAPH_API_URL
LANGSMITH_API_KEY
API_PORT  (default 4000)
```

- Never move service-role keys or server secrets into web or mobile apps
- `apps/api/src/lib/env.ts` also requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` — intentional duplication, keep it
- Always update `.env.example` files when adding new env vars

---

## Code Conventions

- TypeScript throughout, strict mode
- ESM in the API and packages
- Absolute imports via `@/` inside each app
- Workspace imports via `@solo-agents/*`
- Double quotes and semicolons
- Tailwind v4 in `apps/web` only — not in api or mobile
- Shared CSS tokens in `apps/web/app/globals.css`

### UI Direction

**Web:** premium dark aesthetic — large radii, layered dark surfaces, muted slate text, violet accent. Extend `globals.css` token system. Do not introduce generic white-card SaaS styling.

**Mobile:** native mobile patterns — full-screen layouts, chat bubbles (user right/violet, assistant left/dark), bottom tab navigation, modal sheets, settings-style rows. Do not port the web card-stacking layout to mobile.

### Scaffolding and Placeholders

Some flows are intentionally scaffolded:
- `apps/web/src/lib/api/services/bootstrap-service.ts`
- `packages/config/src/index.ts` via `API_TODOS`

Prefer replacing placeholder data behind the existing typed interface rather than ripping out scaffolding.

---

## Next.js 16 — Critical Rules

Next 16 changed several defaults. Before touching anything under `apps/web`:

1. Read the installed docs at `node_modules/.pnpm/next@16.2.3_.../node_modules/next/dist/docs/`
2. `next dev` and `next build` use **Turbopack** by default
3. The proxy/middleware file must be named `proxy.ts` — never `middleware.ts`
4. App Router layouts and pages are Server Components unless marked `"use client"`

---

## Change Strategy

1. Identify whether the change belongs in web, api, mobile, or a shared package
2. If it affects shared contracts → update `packages/types` first
3. Verify auth and env boundaries before adding new integrations
4. For web changes → check the Next 16 docs before using framework APIs
5. For mobile changes → follow Expo Router conventions, do not introduce React Navigation directly

Prefer small, composable changes over broad rewrites.

---

## Things to Avoid

- Assuming older Next.js behavior without checking the installed docs
- Introducing Pages Router conventions into the web app
- Exposing backend secrets to browser or mobile
- Duplicating contracts per-app instead of using shared packages
- Turning the API into a fat rewrite of the existing platform
- Removing scaffold/fallback behavior without the task requiring it
- Using `activeWorkspaceId` for Solo BFF routes — use `soloWorkspaceId`
- Re-fetching bootstrap data per-tab in mobile — use `useAppDataContext()`
- Porting web card-stacking UI patterns to the mobile app
- Skipping typecheck after making changes

---

## Start Here

When oriented to a new task, read these first:

| File | Why |
|---|---|
| `packages/types/src/index.ts` | All shared DTOs |
| `packages/config/src/index.ts` | App name, nav, shared constants |
| `apps/api/src/services/platform-data.ts` | Core backend data layer |
| `apps/web/app/(app)/layout.tsx` | Auth enforcement on web |
| `apps/web/proxy.ts` | Session middleware |
| `apps/mobile/src/app/(tabs)/_layout.tsx` | Mobile navigation |
| `apps/mobile/src/providers/app-data-provider.tsx` | Mobile data context |
