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

## Setup
1. Install deps:
   ```bash
   npm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env
   ```
3. Generate + migrate + seed:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```
4. Start:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`

## Prisma notes
- Schema: `prisma/schema.prisma`
- Migration command: `npm run prisma:migrate`
- Seed command: `npm run prisma:seed`
- SQLite file: `blueclaw.db` (from `DATABASE_URL=file:./blueclaw.db`)

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

## Tests
```bash
npm test
```
Includes:
- scoring unit tests
- dedup unit tests
- polling integration test
- duplicate suppression check
- mock mode path validation via integration flow

## Demo checklist
- Create watch via dashboard or `/api/openclaw/action`
- Click Run Now
- Verify new match appears in recent matches
- Verify notification record appears
- Re-run and verify duplicates are suppressed
