# Rone API expansion implementation plan

Status: implementation resumed under the active expansion goal. Existing local draft code does not satisfy a phase's acceptance criteria until checked; consult the tracker for evidence and remaining work. The documentation-only checkpoint below is historical.

Prepared: October 11, 2026, Asia/Manila. API reference: Rone Arena 1.2.3.

Planning review: October 12, 2026. The canonical Swagger page and OpenAPI schema were accessible during this review. This documentation pass does not implement, commit, push, or deploy features. Preserve existing local work and audit it before resuming implementation.

This is a temporary working plan for the six additions requested in chat. Start or resume implementation only when the user asks. Use the [tracker](./rone-api-expansion-tracker.md) to record progress, evidence, and remaining work. Proposed route names and cache intervals below are project decisions, not upstream requirements.

Latest planning checkpoint: October 12, 2026. The working tree already contains expansion drafts and local foundation commit `be7e01c`. This review preserves that work and changes planning documents only. The canonical Swagger page timed out during the latest read; the provider's public esports router was accessible on GitHub. Earlier schema observations below are dated evidence, not a claim that every endpoint is currently healthy. Recheck live contracts at the start of implementation.

## 1. Outcome and scope

Expand MLBB Stats into a useful reference and scouting site while retaining the existing hero, rank, meta, and account pages.

The agreed release includes all six features:

1. Searchable item, battle spell, and emblem/talent explorers, linked from hero builds.
2. Hero win rates by match duration, with lane and rank filters.
3. An esports hub for the Philippine and Indonesian professional leagues, including schedules, standings, and match details.
4. A playoff scenario simulator, plus a custom league standings calculator within the same feature family.
5. A consecutive-win calculator under Tools.
6. Desktop/mobile wallpaper galleries, including hero-specific galleries.

These are additions to the current product. Reusing an existing counter, trend, or build feed is preferable to duplicating it under a new label. Academy build data must not automatically replace the current build source: its description warns about historical/backward-compatibility use.

Out of scope for this release: account-auth changes, more deprecated player endpoints, community ratings, IP lookup, user-uploaded images, saved cloud accounts/scenarios, wagering features, a general CMS, and patch-note articles invented from version metadata. Rank guides and recommended-content articles can be considered separately later.

## 2. Baseline and constraints

- Next.js 16.2.1 App Router, React 19, TypeScript, Tailwind v4, Recharts, Base UI.
- Read the relevant installed guides in `node_modules/next/dist/docs/` before implementation, as required by `AGENTS.md`. The current project does not enable Cache Components; do not silently migrate the caching model as part of a feature.
- `lib/mlbb/client.ts` validates and caches collection data, but query/mutation helpers assume a `code` response envelope. Esports responses do not consistently have that envelope.
- Public hero requests now recover from canonical-host 403 responses using `https://arena.fastapicloud.dev/api`. Preserve that production fix and extend it deliberately to the new public services.
- Some existing lint failures predate this work. Record the baseline, require changed files to pass targeted lint, and avoid turning this feature release into an unrelated repository cleanup.
- The original Tools page redirected home. The working tree now contains a draft Tools hub and feature routes; audit their behavior rather than recreating them. The same distinction applies to draft build-reference links, navigation, and source adapters.
- Existing hero filters cover rank and daily trend windows. Match-duration buckets are a separate concept and need their own lane control and explanation.
- The desktop and mobile navigation are configured separately. Both need updating; the current mobile bar has five slots.
- `docs/screenshots/` already contains user files. Preserve them during implementation and cleanup.

## 3. Information architecture and user experience

### Proposed routes

| Route | Purpose |
| --- | --- |
| `/academy` | Reference hub linking items, spells, and emblems |
| `/academy/items` | Searchable, filterable item catalog |
| `/academy/items/[id]` | Shareable item detail page |
| `/academy/spells` and `/academy/spells/[id]` | Battle spell catalog and details |
| `/academy/emblems` and `/academy/emblems/[id]` | Emblem families, talent tiers, and details |
| `/heroes/[slug]` | Existing page, augmented with catalog links, duration statistics, and gallery preview |
| `/heroes/[slug]/wallpapers` | Hero gallery with device selection |
| `/wallpapers` | Global wallpaper gallery |
| `/tools` | Tools hub replacing the redirect |
| `/tools/win-rate` | Consecutive-win calculator |
| `/tools/league-calculator` | Custom league simulator/calculator |
| `/esports` | League selection and overview; default Philippines |
| `/esports/[league]` | Schedule and standings for `ph` or `id` |
| `/esports/[league]/matches/[identifier]` | Match details; league controls identifier validation |
| `/esports/[league]/simulator` | Real-league playoff scenarios |

Use existing visual tokens, spacing, cards, headings, and loading/error patterns. Avoid adding a new visual system.

Desktop: retain Heroes, Rank, Meta, and Account; introduce an Explore menu for Academy, Esports, Tools, and Wallpapers. On narrow desktop widths, collapse links before they overflow.

Mobile: retain a five-slot bottom bar with Home, Heroes, Meta, Explore, Account. Explore opens an accessible menu containing Rank, Academy, Esports, Tools, and Wallpapers. Rank remains discoverable from Heroes and the homepage. Confirm this proposed navigation during visual review, not as a prerequisite to data work.

Filters belong in URL query parameters where useful: search/category, league/week, hero rank/lane, and wallpaper device/page. Do not place a large simulation body in a URL. Support Back/Forward and preserve the selected context when opening a detail and returning.

For keyboard and touch users, all detail actions must be buttons or links. Provide visible focus, descriptive labels, Escape dismissal and focus restoration for overlays, and readable tables/charts without relying on color alone.

## 4. Source contracts and initial evidence

Read the [OpenAPI schema](https://arena.rone.dev/api/openapi.json) again at the start of each phase; endpoints and schemas can change. Application code uses paths relative to `/api`.

| Feature | Upstream paths | Contract notes |
| --- | --- | --- |
| Items | `/academy/equipment`, `/academy/equipment/expanded` | Paginated collections; expanded catalog has item effects/details |
| Spells/emblems | `/academy/spells`, `/academy/emblems`, `/academy/roles` | Normalize differing nested records; distinguish emblem family from talent |
| Duration statistics | `/academy/heroes/{hero}/lane`, `/academy/heroes/{hero}/win-rate/timeline` | Timeline requires lane; supports rank; duration buckets differ from daily trends |
| Esports | `/esports/{league}/schedule`, `/esports/{league}/standings`, league-specific match routes | Structured objects rather than hero collection envelopes |
| Scenarios | POST `/esports/{league}/standings/simulate`, POST `/esports/standings/calculate` | Computations returning structured simulation data |
| Win-rate tool | `/addon/win-rate-calculator` | Inputs named `match-now`, `wr-now`, `wr-future`; dedicated result shape |
| Wallpapers | `/heroes/wallpapers`, `/heroes/{hero}/wallpapers` | Collection records include multiple image resolutions |

Observed during planning: expanded equipment, spells, emblems, Aulus lane/duration data, and Philippine standings returned successful responses through the backup. Aulus Academy builds also returned data when lane was supplied; that proves availability, not freshness. Simulation POST behavior and match-detail examples must still be sampled in Phase 0. Docs examples are not production fixtures.

Primary references:

- [Academy routes](https://github.com/ridwaanhall/rone-arena-api/blob/main/src/app/api/routers/academy.py)
- [Esports routes](https://github.com/ridwaanhall/rone-arena-api/blob/main/src/app/api/routers/esports.py)
- [Esports schemas](https://github.com/ridwaanhall/rone-arena-api/blob/main/src/app/schemas/esports.py)
- [Addon routes](https://github.com/ridwaanhall/rone-arena-api/blob/main/src/app/api/routers/addon.py)
- [Hero routes](https://github.com/ridwaanhall/rone-arena-api/blob/main/src/app/api/routers/heroes.py)
- [Provider backup configuration](https://github.com/ridwaanhall/rone-arena-api/blob/main/src/app/core/config.py)

## 5. Shared implementation design

### Endpoint coverage and scope boundary

Reviewed against the live OpenAPI 1.2.3 schema on October 11, 2026. "All" in this plan means all six proposed product additions, including both leagues and both simulation tools. It does not mean displaying every API operation as a new page.

| API capability | Release treatment |
| --- | --- |
| Hero list, ranks, positions, detail, counters, compatibility, and daily trends | Preserve current site behavior; reuse existing modules |
| Equipment, expanded equipment, spells, emblems, roles | Academy catalogs and build inspection in Phase 1 |
| Academy hero lane and duration timeline | Hero duration module in Phase 2 |
| Consecutive-win calculator | Tools in Phase 3 |
| Global and hero wallpapers | Galleries in Phase 4 |
| PH and ID schedules, standings, match details | Esports in Phase 5 |
| League simulation and custom standings calculation | Scenario tools in Phase 6 |
| Academy builds, counters, teammates, stats, and daily trends | Inspect for useful missing fields; preserve the current preferred feeds and avoid duplicate UI |
| Academy hero catalog and filters | Supporting identity/filter data where needed |
| Game version metadata | Supporting freshness/context where its source meaning is clear; not a patch-note generator |
| Rank guides, global/hero recommended articles, ratings, and skill combos | Separate follow-up candidates; not acceptance requirements for these six additions |
| User authentication, privacy, seasons, matches, heroes, and friends | Preserve current account features; separate scope for new private integrations |
| IP lookup | Excluded because it does not serve the site's scouting/reference goals |

Before the first implementation edit, audit the existing uncommitted Academy pages, API route, shared transport changes, and fixtures. Adopt only work that passes the contract and acceptance checks below; presence in the working tree is not verification. Preserve unrelated changes and user screenshots.

The October 12 working-tree inventory also includes duration statistics, tools, wallpapers, both esports leagues, scenario builders, navigation, and sitemap changes. Treat these as drafts to review against this plan, not an instruction to discard or duplicate them. Implement in the phase order below, but reuse any verified draft work.

### Delivery checkpoints

For each phase: confirm the current provider contract, audit existing draft code, complete missing behavior, run focused checks, review the user experience, and update the tracker with dated evidence. Record local verification separately from production verification. Keep a phase open whenever a required acceptance check remains.

Complete API foundation first. Academy and the independent duration/calculator/gallery features follow; esports schedules and match details precede the real-league simulator. Add navigation progressively, then conduct the combined regression and production review. Finish by migrating durable notes and removing only the two temporary planning files.

Use small, reviewable commits when implementation is requested. Follow the user's release instructions at that time; preparing this plan does not itself authorize a new deployment. Avoid assigning completion dates before provider contracts and existing drafts have been audited.

### Transport and validation

Keep HTTP transport, service-specific response validation, and UI normalization separate. Reuse one server-side host/fallback mechanism, with validators for collections, esports schedules/standings/matches, simulation results, and addon results. Do not manufacture `code: 0` around arbitrary JSON to satisfy the existing helper.

Use an explicit public-operation allowlist for 403 failover. Extend it to Academy, wallpapers, esports GETs, the addon calculator, and the two read-only simulation computations. Never treat arbitrary POSTs or `/user/*` requests as public. Preserve authorization headers and private caching rules in the current account flow.

Set bounded request timeouts and bounded retry counts. Retry provider fallbacks rather than looping against a denied host. Validate shape before saving successful results. Keep failed/partial responses out of shared caches and keep server diagnostics free of JWTs, headers, credentials, and query secrets.

Add first-party API routes only where client interactions require them. Browser clients call our origin; they do not inherit host-selection logic or private API configuration. Validate league, identifiers, pagination, filters, and simulation bodies on the server even when forms already validate them.

### Domain models and identity

Proposed modules: `lib/academy/`, `lib/esports/`, `lib/tools/`, and `lib/wallpapers/`, each with raw types, normalized types, loaders, and normalizers. Extend `lib/hero/` only for hero-page integrations.

Use upstream stable IDs for catalog links. Preserve IDs while normalizing build items/spells/talents. If a build omits identity, resolve by a unique normalized catalog name only when unambiguous. Otherwise show the existing description without a misleading link. Do not generate routes from array positions or assume a talent ID is an emblem-family ID.

Render upstream formatted descriptions as readable text or a narrowly sanitized subset. Never insert raw upstream HTML. Preserve paragraph breaks and bullets; show unknown numerical attributes as unavailable rather than zero. Display observed localized names carefully and use our hero catalog as the canonical display-name source when IDs agree.

### Cache and pagination policy

These are initial application choices, subject to measured behavior:

| Data | Successful refresh interval | Failure behavior |
| --- | --- | --- |
| Academy catalogs | 6 hours | Explicit unavailable section; preserve unrelated sections |
| Hero duration statistics | 1 hour | Keep hero page usable and indicate unavailable statistics |
| Wallpaper collections | 6 hours | Gallery error/empty state, without substituting unrelated artwork |
| Esports schedules/standings/details | 5 minutes | Retry affordance and freshness label; no historical hero snapshot |
| Calculator/scenario POST results | No shared HTTP cache initially | Preserve edits and display validation or service error |

Include every relevant query dimension and source host configuration in cache identity. Separate an actual upstream timestamp from our retrieval timestamp; do not invent a source sync date.

Catalog loaders must paginate to completion, deduplicate by ID, and stop on missing records or an appropriate documented cap. A cap must produce an explicit partial-data status. Public list routes should enforce bounded page sizes and avoid fetching the entire collection on every keystroke. Fetch additional gallery pages on demand.

### Client state and performance

Prefer server-rendered initial data and small client islands for filters, forms, and overlays. Reuse the existing client conventions or React Query where it reduces request-state duplication; do not migrate the whole site.

Cancel or disregard superseded responses. A slower request for a previous filter must not overwrite the current selection. Debounce search, trigger simulations with an explicit Run button, and keep unrelated hero modules out of the initial critical fetch path.

Reuse Recharts for duration views and scenario comparisons. Provide a text/table equivalent. Reserve image dimensions, use responsive image sizes, lazy-load gallery images, and add only verified image hosts to the Next image configuration. Check both `wsrv.nl/` and actual proxy URL variants.

## 6. Delivery phases and acceptance criteria

### Phase 0 — API foundation and representative fixtures

Deliver the response validators, public failover rules, bounded transport behavior, and sanitized fixtures for the new services. Sample both leagues, one completed match per league, upcoming matches without details, simulation responses, calculator edge cases, and wallpaper variants.

Resolve source uncertainties here: nested spell/talent identity, item linkage, simulation result metadata, duration bucket boundaries, and current catalog completeness. Record findings in the tracker rather than expanding scope based on assumptions.

Acceptance: a canonical-host 403 reaches the authorized backup for every new public service; private operations still stop on authorization failure. Valid responses normalize correctly, malformed/HTML responses fail safely, failures are not cached, and pagination neither loops nor silently omits later records.

### Phase 1 — Item, spell, and emblem reference

Build the Academy hub, catalog pages, and stable-ID detail pages. Items support name search and source-backed category filters. Details show icon, category, attributes, passive descriptions, and available tips. Spell details show supported descriptions; talent details show tier/family association only when the source establishes it.

Make hero build item/spell/talent entries open the corresponding detail. Use a drawer or dialog for quick inspection where practical, plus a link to the canonical detail page. Missing catalog matches retain usable existing cards.

Likely edits: `components/hero/HeroBuildPlanCard.tsx`, hero types/normalizers, new `components/academy/*`, `app/academy/*`, and relevant API routes.

Acceptance: users can search each catalog, open/share details, inspect build entries, return without losing filters, and operate every interaction on keyboard/mobile. No incorrect links for duplicate names or absent IDs. Sparse descriptions and missing images have meaningful states.

### Phase 2 — Hero match-duration statistics

Add a distinct section to hero pages: lane selector, existing rank context, overall lane win rate, and win rates across duration buckets. Explain that these are results grouped by match length, not a forecast of a hero's power at a precise minute.

Only offer lanes present in that hero's source-backed lane data. Use a sorted bucket chart and accessible table. Handle nonuniform intervals, open-ended ranges, zero values, missing buckets, and localized names. Do not infer sample sizes or statistical certainty if the feed does not provide them.

Load this module independently from builds/counters; changing lane should not reload unrelated hero detail sections. Persist lane/rank in the URL and prevent stale requests from overwriting new filters.

Acceptance: representative single- and multi-lane heroes render correctly; unavailable lanes show no fabricated statistics; bucket boundaries and percent conversion are correct; existing daily trends remain separate and functional.

### Phase 3 — Tools and consecutive-win calculator

Replace the Tools redirect with a hub and create the win-rate form. Inputs: matches played, current percentage, target percentage. Output: additional consecutive wins plus resulting total matches, clearly stating the no-loss assumption.

Define behavior for zero matches, an already-met target, decimal percentages, invalid ranges, and mathematically unreachable targets. Explain the 100% target case when existing losses cannot be erased. Use the addon endpoint through a dedicated adapter; a tested local calculation can keep the tool useful during upstream outages and must be labeled as calculated locally.

For reachable targets, test the smallest valid integer answer against the resulting ratio, rather than relying solely on display rounding. Do not assert an exact past win count from a rounded percentage; explain the estimate or optionally accept wins directly for a local exact calculation.

Acceptance: validated input, no repeated submission spam, clear assumptions, correct rounding/boundaries, and useful behavior when the provider is unavailable. No account connection required.

### Phase 4 — Wallpaper galleries

Create the global gallery and hero galleries, plus a small hero-page preview linking to the full gallery. Device tabs select desktop/mobile; page controls or Load more retain URL context.

Choose the best available resolution for preview and offer actual source variants in the detail viewer. Deduplicate image variants, keep event/multi-hero artwork labeled accurately, and preserve source/MLBB attribution.

Provide an Open full image action. Offer Download where supported by the actual hosting behavior; cross-origin links may open instead of saving. Avoid an unrestricted image proxy solely to force downloading.

Acceptance: desktop/mobile selection, multiple pages, lightbox keyboard controls, image failure handling, accurate hero association, real-resolution links, and no layout shift or oversized initial image payloads.

### Phase 5 — Esports schedules, standings, and match details

Build PH/ID tabs with schedule and standings views. Week filters derive from source data. Match cards show teams/logos, scores or upcoming status, and start times in Asia/Manila by default with an explicit timezone label and optional local-time display.

League-specific identifiers must stay separate: ID match details use a numeric identifier; PH uses a slug. Enable detail links only when the schedule supplies an identifier. Null scores must not appear as completed 0–0 matches.

Match pages show game tabs, winners, team totals where available, player hero/KDA/builds, and PH item purchase sequence where supplied. Do not invent battle spells when not published. Preserve unknown hero/item IDs as readable source entries rather than linking them incorrectly.

Acceptance: both leagues work; completed and upcoming matches differ visibly; midnight/timezone conversion is correct; missing details have a helpful state; tables fit mobile; source freshness and refresh controls are visible. Keep provider's five-minute data cadence in mind when describing freshness.

### Phase 6 — Playoff and custom league scenarios

Build the real-league simulator on Phase 5's normalized schedule. Begin with the real results; let users set, replace, or clear supported match scores. Offer Run scenario, Reset to actual results, and a before/after standings comparison.

Display clinched/alive/eliminated status separately from simulated playoff probability. Explain the chosen model, simulation sample, and estimate limitations. Keep tie outcomes unresolved where the provider does; do not introduce an arbitrary local tiebreaker.

The API supports `form` and `even` models. Begin with the default simulation sample and expose an advanced bounded choice only if needed. Finished scores are 2–0, 2–1, 1–2, or 0–2. Clearing a result requires clearing both scores. Preserve edits on errors and ignore responses belonging to superseded inputs.

The custom league tool supports 2–20 uniquely named teams, generated schedule, result entry, and playoff cutoff. Keep changes local to the browser; export/import a versioned scenario JSON if useful for persistence. Validate imported data as strictly as form input. No account storage or giant URL encoding in this release.

Acceptance: no-edit scenarios match the source baseline; a changed score changes the correct match; team order is handled correctly; invalid scores, team names, cutoffs, and oversized payloads are rejected; probabilities are labeled estimates; reset restores the baseline; retry preserves user work.

### Phase 7 — Navigation, discovery, production verification

Introduce working navigation entries as each feature ships; complete the desktop/mobile Explore structure once destinations are available. Add homepage discovery cards, route metadata, canonical links, loading states, and appropriate sitemap entries. Exclude scenario-specific states and duplicate filter permutations from indexing.

Keep source/game attribution visible. Preserve existing hero/rank/meta/account behavior and avoid raising initial homepage data costs by preloading every new catalog.

Acceptance: all six features are reachable from desktop/mobile navigation, deep links resolve, metadata describes actual content, and there are no dead links or background image requests to unsupported hosts.

## 7. Verification and release workflow

Ship in small phase commits, updating the tracker in each phase. Before changing production, run relevant contract/normalization tests, `npm test`, `npm run typecheck`, targeted ESLint, and `npm run build`. Broaden testing only when new evidence requires it.

Tests should verify actual risks: public fallback boundaries, response shapes, pagination, ID joins, percent/bucket interpretation, identifier differences, win-rate mathematics, and scenario validation. Use representative sanitized fixtures; do not make normal unit tests depend on live scrape results.

Visually review at approximately 390px, 768px, and 1440px. Check keyboard interaction, focus handling, overflow, long descriptions/names, empty/error states, and image loading. Record defects and repairs in the tracker.

After a requested push/deployment, verify on Vercel, not only locally: source data loads through backup if needed, current images succeed, new public routes have appropriate cache headers, calculations work, and runtime diagnostics show no unresolved systemic failure. Deployment Ready or HTTP 200 alone does not establish data health.

If a phase regresses an existing public page, fix or roll back that phase before continuing. Keep features modular enough that an unavailable optional module does not disable the core site.

## 8. Risks and decisions to resolve during implementation

| Risk | Planned response |
| --- | --- |
| Upstream schema/content changes | Inspect live contracts per phase; validate and preserve unknown/missing states |
| Vercel public-source 403 | Explicit public fallback policy with regression tests; production verification |
| Academy builds described as historical | Retain current build source; source/age labels for any optional comparison |
| Missing catalog IDs in current builds | Stable IDs first; unique-name fallback only; no misleading links |
| Mixed localization in data | Hero ID joins and normalized display names; do not claim English coverage blindly |
| Simulation expense or stale results | Explicit Run action, bounded inputs, default sample, superseded-response guard |
| Esports scraper outage/season change | Explicit unavailable state; source-driven season/week structure |
| Excess navigation and hero-page weight | Explore menu, lazy independent modules, measured loading |
| Rounded percentages or misleading duration claims | State assumptions; retain precision internally; label observational statistics |

The plan does not require choosing a new framework, database, paid service, or user-auth mechanism. Resolve routine UI details using existing design conventions; record material contract decisions with evidence.

## 9. Completion and temporary-doc cleanup

The expansion is complete when every phase's acceptance criteria are met, all six features are production-verified, existing routes still work, and no required tracker item remains unresolved.

Then consolidate durable information into README or a concise maintained architecture/API document: supported routes, source/fallback behavior, cache intervals, verification commands, calculator assumptions, and simulation limitations.

Delete only `docs/plans/rone-api-expansion-plan.md` and `docs/plans/rone-api-expansion-tracker.md` after migrating useful notes and removing links to them. Preserve existing screenshots and any independently useful documentation. Git history retains the completed planning record. Do not clean the plan early or delete the entire `docs/` directory.
