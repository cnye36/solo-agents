# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy package.json files for all workspaces
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/api ./apps/api
COPY packages/config ./packages/config
COPY packages/types ./packages/types

# Build workspace packages and API
RUN pnpm --filter @solo-agents/types build && \
    pnpm --filter @solo-agents/config build && \
    pnpm --filter @solo-agents/api build

# Production stage
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/config/dist ./packages/config/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV API_PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]
