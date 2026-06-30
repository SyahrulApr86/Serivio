# ── Build stage ──────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build
# Standalone MCP server (self-contained bundle; $lib resolves against .svelte-kit here)
RUN bun run build:mcp

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Only production deps (includes postgres, drizzle-orm — needed by migrate.ts)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# App build output
COPY --from=builder /app/build ./build

# Standalone MCP server bundle (used by the mcp service in docker-compose)
COPY --from=builder /app/build-mcp ./build-mcp

# Migration script + SQL files (no drizzle-kit needed, uses drizzle-orm migrator)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/lib/server/db/migrate.ts ./migrate.ts

# Entrypoint: migrate then start
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
