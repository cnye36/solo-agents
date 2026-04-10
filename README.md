# Solo Agents

This repo is now structured as a clean monorepo:

- `apps/web`: Next.js product app for the single-assistant experience
- `apps/api`: thin backend/BFF that talks to the existing AffinityBots platform
- `packages/config`: shared app metadata and typed config constants
- `packages/types`: shared DTO and domain types
- `packages/ui`: shared UI package placeholder

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the product web app:

```bash
pnpm dev:web
```

Run the backend/BFF:

```bash
pnpm dev:api
```

## Environment Boundaries

Frontend-safe values belong in `apps/web/.env.local`, for example:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_URL`

Private values belong in `apps/api/.env`, for example:

- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URI`
- `LANGGRAPH_API_URL`
- `LANGSMITH_API_KEY`
- billing/provider secrets

Do not place private backend credentials in the web app.
