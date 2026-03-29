# MLBB Stats

MLBB Stats is a Next.js App Router project for browsing the Mobile Legends roster, opening hero detail pages, tracking the live meta, and connecting an authenticated MLBB account for a private player dashboard.

## Phase 1 status

Current public routes:

- `/` landing page
- `/heroes` hero browser with search, role filters, and sorting
- `/heroes/[slug]` hero detail pages with builds plus rank- and window-controlled matchup and trend modules
- `/heroes/rank` filtered rank board grouped by tier
- `/meta` rank-, lane-, and role-aware meta dashboard with shareable filters
- `/player` authenticated account-connect entry
- `/player/[playerKey]` private player dashboard for the connected account
- `/sitemap.xml`, `/robots.txt`, and Open Graph image routes

Deferred routes currently exist as placeholders and are marked non-indexable:

- `/tools`

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts for trend visualizations

## Environment

Create a local `.env.local` with the values from `.env.example`.

Required variables:

- `MLBB_API_BASE_URL` upstream MLBB API base URL
- `NEXT_PUBLIC_SITE_URL` canonical site URL used for metadata, sitemap, and Open Graph output
- `MLBB_PLAYER_SESSION_SECRET` long random secret used to sign the HTTP-only player session cookie

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Notes

- Hero browser data is normalized from multiple upstream endpoints before it reaches the UI.
- Hero detail pages use a fault-tolerant loader so optional modules can fall back cleanly if a single upstream endpoint is missing data.
- Player account-connect uses same-origin route handlers and a signed HTTP-only cookie so the upstream JWT is kept out of client-side runtime.
- SEO is wired through typed metadata helpers, JSON-LD, sitemap generation, robots rules, and route-level Open Graph images.
