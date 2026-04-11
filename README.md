# Solo Agents

Monorepo for the single-assistant product: a **Next.js** frontend (`apps/web`) and a **Hono** backend/BFF (`apps/api`) that integrates with Supabase and the AffinityBots / LangGraph stack. Shared types and config live under `packages/`.

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 10.x — the repo pins the package manager in `package.json` (`packageManager` field). Enable with [Corepack](https://nodejs.org/api/corepack.html): `corepack enable`

## Quick start

```bash
git clone https://github.com/cnye36/solo-agents.git
cd solo-agents
pnpm install
```

Copy environment templates and fill in values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Start both apps in separate terminals (web defaults to port **3000**, API to **4000** when using the example URLs):

```bash
pnpm dev:web
pnpm dev:api
```

Open the app at [http://localhost:3000](http://localhost:3000). Ensure `NEXT_PUBLIC_API_BASE_URL` in `apps/web/.env.local` matches where the API listens (e.g. `http://localhost:4000`).

## Repository layout

| Path | Role |
|------|------|
| `apps/web` | Next.js UI, auth (Supabase SSR), calls the BFF for platform data |
| `apps/api` | Hono server: bootstrap, threads/chat proxy, account helpers — **secrets stay here** |
| `packages/types` | Shared DTOs and domain types |
| `packages/config` | Shared app metadata and constants |
| `packages/ui` | Shared UI (minimal; extend as needed) |

## Environment variables

**Browser-safe / public** — `apps/web/.env.local` (see `apps/web/.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL` — BFF base URL the browser uses
- `NEXT_PUBLIC_APP_URL` — canonical app origin (e.g. dev or production URL)

**Server-only** — `apps/api/.env` (see `apps/api/.env.example` for the full template):

- Required by the API: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (shared naming with Supabase tooling), `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `API_PORT` (defaults to **4000**), `LANGGRAPH_API_URL`, `LANGSMITH_API_KEY`, `AFFINITYBOTS_BASE_URL`

Never commit real `.env` files. The repo ignores `.env*` under `apps/` and the root. Keep service role keys and other backend secrets **only** in `apps/api/.env`.

## Scripts (from repo root)

| Command | Description |
|---------|-------------|
| `pnpm dev:web` | Next.js dev server |
| `pnpm dev:api` | API dev server (`tsx watch`) |
| `pnpm build` | Build all workspace packages that define `build` |
| `pnpm lint` | Lint web; API lint is stubbed until ESLint is wired for `apps/api` |
| `pnpm typecheck` | Typecheck all packages and apps |
