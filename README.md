# Serivio

> Track every story, never lose your place.

Serivio is a personal media tracker — a single place to record every anime, manga,
manhwa, novel, film and TV series you follow, and exactly where you left off.

## Stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Framework      | SvelteKit (Svelte 5 runes) on **Bun**    |
| Database / ORM | PostgreSQL + **Drizzle**                 |
| Auth           | **Better Auth** (username + password)    |
| Validation     | **Valibot**                              |
| Forms          | **Superforms**                           |
| Search         | Client-side (instant, no server needed)  |
| Object storage | **MinIO** (cover images)                 |
| AI             | OpenAI-compatible (GPT / DeepSeek) + MCP |
| Styling        | **Tailwind v4** + Vetric design tokens   |
| Tests          | **Vitest** (unit) + **Playwright** (e2e) |

---

## Local development

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- Docker + Docker Compose

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Start infrastructure (postgres, redis, minio)
docker compose up -d

# 3. Configure environment
cp .env.example .env        # defaults already match docker-compose
#    To use the AI assistant, set AI_GPT_API_KEY (and/or AI_DEEPSEEK_API_KEY)

# 4. Apply database migrations
bun run db:migrate

# 5. (optional) Seed demo data — user "demo" / password "password123"
bun run db:seed

# 6. Run the dev server
bun run dev                 # http://localhost:5173
```

### Dev services

| Service       | URL / Port                                      |
| ------------- | ----------------------------------------------- |
| App           | http://localhost:5173                           |
| PostgreSQL    | localhost:5437                                  |
| Redis         | localhost:6379                                  |
| MinIO API     | http://localhost:9000                           |
| MinIO console | http://localhost:9001 (minioadmin / minioadmin) |

---

## Production deployment (VPS)

The app is fully dockerized. A single `docker compose` command brings up everything:
app, postgres, redis, and minio. Migrations run automatically on startup.

### Steps

```bash
# 1. Clone the repo on the VPS
git clone <repo-url> serivio && cd serivio

# 2. Create production env file from the template
cp .env.production.example .env.production

# 3. Fill in every CHANGE_ME value — minimum required:
#      POSTGRES_PASSWORD
#      BETTER_AUTH_SECRET  →  openssl rand -base64 32
#      BETTER_AUTH_URL     →  https://yourdomain.com
#      MINIO_ACCESS_KEY, MINIO_SECRET_KEY
#      MINIO_PUBLIC_URL    →  public URL browsers use to load cover images
nano .env.production

# 4. Build and start
docker compose -f docker-compose.prod.yml up -d --build
```

App runs on **port 3000**. Put Nginx or Caddy in front for TLS:

```
# Caddyfile
serivio.example.com {
    reverse_proxy localhost:3000
}
```

For cover images, either expose MinIO port 9000 directly or proxy it through your
domain and set `MINIO_PUBLIC_URL` accordingly.

In production, also set the AI keys (`AI_GPT_API_KEY` / `AI_DEEPSEEK_API_KEY`) in
`.env.production` to enable the assistant. The compose file runs a separate **`mcp`**
service on **port 3001** — proxy or expose it if you want external MCP clients to reach it.

### Update

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## AI assistant & MCP

The in-app assistant (right sidebar, toggle in the navbar) and the MCP server share one
tool layer, so they behave identically. Both can search, list, create, update, delete
series, bump progress, and manage collections — all scoped to the signed-in user.

**Providers** are OpenAI-compatible. Configure either or both in your env file; the default
is `gpt`, switchable per conversation in the sidebar:

```
AI_DEFAULT_PROVIDER=gpt
AI_GPT_BASE_URL=https://api.bluesminds.com/v1   # GPT (Bluesminds)
AI_GPT_API_KEY=...
AI_GPT_MODEL=gpt-5.5
AI_DEEPSEEK_BASE_URL=https://api.deepseek.com   # DeepSeek
AI_DEEPSEEK_API_KEY=...
AI_DEEPSEEK_MODEL=deepseek-chat
```

**Connecting an MCP client** (Claude Code, Codex, …):

1. In the app, open **Settings → API Access & MCP** and generate a token.
2. Add Serivio as a remote (Streamable HTTP) MCP server with a bearer header:

```bash
claude mcp add --transport http serivio http://YOUR_HOST:3001/mcp \
  --header "Authorization: Bearer <your-token>"
```

Run the MCP server locally with `bun run mcp:dev` (defaults to port `3001`, override with
`MCP_PORT`).

---

## Scripts

| Script                | Purpose                         |
| --------------------- | ------------------------------- |
| `bun run dev`         | Dev server                      |
| `bun run build`       | Production build (adapter-node) |
| `bun run build:mcp`   | Bundle the standalone MCP server |
| `bun run mcp:dev`     | Run the MCP server from source  |
| `bun run preview`     | Preview the production build    |
| `bun run check`       | svelte-check type checking      |
| `bun run lint`        | Prettier + ESLint               |
| `bun run db:generate` | Generate a Drizzle migration    |
| `bun run db:migrate`  | Apply migrations                |
| `bun run db:seed`     | Seed demo user + sample series  |
| `bun run db:studio`   | Drizzle Studio                  |
| `bun run test`        | Unit tests (Vitest)             |
| `bun run test:e2e`    | End-to-end tests (Playwright)   |

---

## Features

- **Auth** — session-based username + password (Better Auth + Redis sessions)
- **Dashboard** — Continue Watching/Reading, recently updated, status stats
- **Add / edit series** — all media fields, cover upload to MinIO
- **Continue button** — one tap increments episode/chapter, logs history, auto-completes at total
- **Library** — instant client-side filter by media/status, sort six ways, live search with animations
- **Navbar search** — instant dropdown with keyboard navigation
- **Collections** — group series into custom shelves
- **Statistics** — breakdown by media type x status
- **AI assistant** — chat sidebar that answers questions about your library and does CRUD by chat (add/update series, bump progress, manage collections); attach a poster and it reads it (vision) and sets the cover. Switch between GPT and DeepSeek per conversation; history is persisted.
- **MCP server** — standalone Streamable-HTTP server exposing the same library tools, so external clients (Claude Code, Codex) can manage your library too
- **Landing page** — public marketing page with 3D cubes and hero poster collage

## Project layout

```
src/
  lib/
    components/        # UI components (Nav, SeriesCard, HeroCollage, FloatingCubes...)
    server/
      auth.ts          # Better Auth config
      db/              # Drizzle schema, migrations, seed
      series.ts        # Series domain logic
      storage.ts       # MinIO cover uploads
    validation/        # Valibot schemas
  routes/
    (auth)/            # login, register
    (app)/             # dashboard, library, series, collections, stats, add
    api/               # upload-cover, Better Auth handler
    +page.svelte       # landing page
e2e/                   # Playwright tests
drizzle/               # SQL migrations
static/
  posters/             # Hero collage poster images
```
