# ── Build stage ──────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Only production deps (includes postgres, drizzle-orm — needed by migrate.ts)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# App build output
COPY --from=builder /app/build ./build

# Migration script + SQL files (no drizzle-kit needed, uses drizzle-orm migrator)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/lib/server/db/migrate.ts ./migrate.ts

# Entrypoint: migrate then start
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
