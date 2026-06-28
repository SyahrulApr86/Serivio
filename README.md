# Serivio

> Track every story, never lose your place.

Serivio is a personal media tracker — a single place to record every anime, manga,
manhwa, novel, film and TV series you follow, and exactly where you left off. It is
not a streaming or reading platform; it just remembers your progress so you don't
have to.

Built per [PRD.md](./PRD.md), styled with the **Vetric** iridescent-prism design
system ([DESIGN.md](./DESIGN.md)).

## Stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Framework      | SvelteKit (Svelte 5 runes) on **Bun**    |
| Database / ORM | PostgreSQL + **Drizzle**                 |
| Auth           | **Better Auth** (username + password)    |
| Validation     | **Valibot**                              |
| Forms          | **Superforms**                           |
| Search         | **Elasticsearch** (fuzzy, user-scoped)   |
| Object storage | **MinIO** (cover images)                 |
| Styling        | **Tailwind v4** + Vetric design tokens   |
| Tests          | **Vitest** (unit) + **Playwright** (e2e) |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.3
- Docker + Docker Compose

## Getting started

```bash
# 1. Install dependencies
bun install

# 2. Start infrastructure (postgres, redis, minio, elasticsearch)
docker compose up -d

# 3. Configure environment
cp .env.example .env        # defaults already match docker-compose

# 4. Apply database migrations
bun run db:migrate

# 5. (optional) Seed demo data — user "demo" / password "password123"
bun run db:seed
bun run search:reindex      # populate Elasticsearch from Postgres

# 6. Run the dev server
bun run dev                 # http://localhost:5173
```

## Scripts

| Script                   | Purpose                         |
| ------------------------ | ------------------------------- |
| `bun run dev`            | Dev server                      |
| `bun run build`          | Production build (adapter-node) |
| `bun run preview`        | Preview the production build    |
| `bun run check`          | `svelte-check` type checking    |
| `bun run lint`           | Prettier + ESLint               |
| `bun run db:generate`    | Generate a Drizzle migration    |
| `bun run db:migrate`     | Apply migrations                |
| `bun run db:seed`        | Seed demo user + sample series  |
| `bun run db:studio`      | Drizzle Studio                  |
| `bun run search:reindex` | Rebuild the Elasticsearch index |
| `bun run test`           | Unit tests (Vitest)             |
| `bun run test:e2e`       | End-to-end tests (Playwright)   |

## Services

| Service       | URL / Port                                      |
| ------------- | ----------------------------------------------- |
| App (dev)     | http://localhost:5173                           |
| PostgreSQL    | `localhost:5432` (serivio / serivio)            |
| Redis         | `localhost:6379`                                |
| Elasticsearch | http://localhost:9200                           |
| MinIO API     | http://localhost:9000                           |
| MinIO console | http://localhost:9001 (minioadmin / minioadmin) |

## Features

- **Auth** — session-based username + password (Better Auth).
- **Dashboard** — Continue Watching/Reading, Recently Updated, status statistics.
- **Add / edit series** — all PRD fields, per-media progress, cover upload to MinIO.
- **Continue button** — one tap increments episode/chapter and logs history;
  auto-completes when the total is reached.
- **Library** — filter by media & status, sort six ways, fuzzy search via Elasticsearch.
- **Collections** — group series into custom shelves.
- **Statistics** — breakdown by media type × status.
- **Landing page** — public Vetric-styled marketing page.

## Project layout

```
src/
  lib/
    components/        # Vetric UI components + app components
    server/
      auth.ts          # Better Auth config
      db/              # Drizzle schema, migrations, seed
      search/          # Elasticsearch client + sync (fetch-based)
      series.ts        # series domain logic
      storage.ts       # MinIO cover uploads
    validation/        # Valibot schemas
  routes/
    (auth)/            # login, register
    (app)/             # dashboard, library, series, collections, stats, add
    api/auth/[...all]/ # Better Auth REST handler
    +page.svelte       # landing
e2e/                   # Playwright tests
```

## Architecture notes

- **Search client uses `fetch`, not `@elastic/elasticsearch`** — the official
  transport hangs under the Bun runtime, so `src/lib/server/search/client.ts`
  speaks to Elasticsearch over its REST API directly. Index writes are
  fire-and-forget: a search hiccup never blocks the primary Postgres write.
- **Server env via `process.env`** (`src/lib/server/env.ts`) so the same modules
  work inside SvelteKit and in standalone Bun scripts (migrate / seed / reindex).
