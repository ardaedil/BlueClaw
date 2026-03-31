# BlueClaw MVP

BlueClaw is an OpenClaw-powered autonomous eBay watch agent. It continuously polls eBay Browse API (or mock data), deduplicates seen items, scores matches, stores notifications, and surfaces alerts to OpenClaw + dashboard.

## Stack
- Node.js + TypeScript + Express
- Prisma + SQLite
- Official eBay Browse API search endpoint
- Tailwind-styled dashboard (static HTML + JS)
- Vitest tests

## Features
- Watch CRUD (`/api/watches`)
- Polling engine + scheduler
- Manual run now (single/all)
- Seen listing memory + duplicate suppression
- Transparent score explanation + reasons
- Notification persistence + optional OpenClaw webhook delivery
- OpenClaw action bridge endpoint
- Mock mode for reliable demos

## Local setup (exact order)
1. Install deps:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Apply local SQLite migration:
   ```bash
   npm run prisma:migrate
   ```
5. (Optional but recommended) Seed demo data:
   ```bash
   npm run db:seed
   ```
6. Run tests:
   ```bash
   npm test
   ```
7. Run app:
   ```bash
   npm run dev
   ```
8. Open dashboard at `http://localhost:3000`.

## Prisma + SQLite behavior
- Schema: `prisma/schema.prisma`
- Local dev DB default: `prisma/blueclaw.db`
- Test DB default: `prisma/blueclaw.test.db`
- `prisma/.env` is committed with a SQLite `DATABASE_URL` fallback so `npx prisma migrate dev` works out of the box.
- Tests run against the isolated test database and automatically `db push` before execution.

## Scripts
- `npm run dev` — run API + dashboard dev server
- `npm run build` — compile TypeScript
- `npm test` — run test suite (isolated Prisma test DB)
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate` — apply Prisma migrations (SQLite)
- `npm run prisma:seed` / `npm run db:seed` — seed demo data

## eBay mode
- `EBAY_MOCK_MODE=true` uses `src/mocks/ebay-search-response.json`.
- `EBAY_MOCK_MODE=false` requires `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`.
- Uses only Browse API search endpoint (no scraping).

## OpenClaw-centric flow
- OpenClaw calls `POST /api/openclaw/action` with a supported action.
- BlueClaw executes action with least privilege.
- BlueClaw sends back alerts to `OPENCLAW_WEBHOOK_URL` (optional).

## VPS deployment notes
- Set `NODE_ENV=production`.
- Use `npm run build && npm run start`.
- Put behind reverse proxy (Caddy/Nginx).
- Keep SQLite on persistent disk; optionally move to managed Postgres later with Prisma datasource change.

## Docker Compose (demo)
```bash
docker compose up
```

## Demo checklist
- Create watch via dashboard or `/api/openclaw/action`
- Click Run Now
- Verify new match appears in recent matches
- Verify notification record appears
- Re-run and verify duplicates are suppressed
