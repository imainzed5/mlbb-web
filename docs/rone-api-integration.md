# Rone API integration

This document describes the expansion implementation. See the temporary plan/tracker for release acceptance and outstanding verification until the release is complete.

## Public surfaces

| Route | Behavior |
| --- | --- |
| `/academy` | Items, battle spells, emblem families and talents |
| `/academy/{items,spells,emblems}/[id]` | Stable catalog detail links; catalog search/category context retained on return |
| `/heroes/[slug]` | Build catalog inspection, independent lane/rank duration chart and table, streamed artwork preview |
| `/wallpapers`, `/heroes/[slug]/wallpapers` | Device/page filters, resolution viewer, source image links |
| `/esports/ph`, `/esports/id` | Source schedules, standings, weeks and match links |
| `/esports/[league]/matches/[identifier]` | Game selection, team/player data and available purchase sequences |
| `/esports/[league]/simulator` | Actual-result baseline, score edits, reset, provider scenario comparison |
| `/tools/win-rate` | Consecutive-win target calculator |
| `/tools/league-calculator` | Custom teams, generated schedule, scores and scenario JSON import/export |

Desktop Explore and the mobile Explore slot link to the new sections. Search/filter URL permutations are not additional sitemap entries. Scenario tools are excluded from indexing.

## Transport, validation and caching

`lib/mlbb/client.ts` owns bounded server-side requests and provider fallback. Canonical source: `https://arena.rone.dev/api`; published backup: `https://arena.fastapicloud.dev/api`. New clients use first-party routes where interaction needs them. Private requests retain their authorization boundaries.

An explicit public-operation allowlist permits GET fallback for heroes, Academy, supported esports routes and the win-rate calculator. POST fallback is limited to PH/ID standings simulation and custom standings calculation. Arbitrary POST and account operations are not public computations.

Collection and structured-resource validators run before successful data enters shared caches. Invalid responses trigger bounded fallback; thrown failures are not stored as successful results. Catalog pagination honors source page caps, deduplicates stable record IDs, detects repeated pages, and labels incomplete results. Partial catalog API responses use `no-store`.

| Resource | Refresh interval |
| --- | --- |
| Academy catalogs and wallpaper pages | 6 hours |
| Hero duration data | 1 hour |
| Esports schedules, standings and match details | 5 minutes |
| Win-rate responses and scenario computations | No shared HTTP cache |

Optional modules have independent unavailable/retry states. Retrieval/render time is distinct from an upstream sync timestamp. Reloading a view does not bypass the provider or application cache.

## Identity and numerical meaning

Catalog links prefer upstream item/spell IDs; name matching is allowed only when unique. Talent gift IDs and emblem-family IDs use distinct namespaces. Missing identities remain readable without fabricated links. Descriptions are normalized to text; upstream HTML is not inserted directly.

Duration win rates convert source fractions to percentages, preserve unknown values and open-ended buckets, and offer only source-backed lanes. These are observations grouped by match duration, with no inferred sample size, interval inclusivity or prediction claim.

The consecutive-win calculation uses the smallest integer number of additional wins that reaches the target with no further losses. Rounded input percentages make the actual-record result an estimate. Existing losses make a 100% target unreachable. Zero played matches require a zero current rate. Provider results are used only when they agree with validated local mathematics; otherwise the result is labeled local.

## Esports and scenarios

PH match identifiers are slugs; ID identifiers are numeric. Null scores remain unknown. Times are displayed in Asia/Manila. Source player assets that cannot be identified remain readable source IDs; absent battle spells are not invented.

Scenario status and playoff estimate are separate. `form` and `even` are provider models; estimates are not guarantees. A no-edit simulation can reorder teams with equal records due to provider tiebreak calculation. The comparison preserves published baseline ranks and provider scenario ranks, explains that difference, and preserves unresolved tiebreaks.

Server validation permits 2–20 unique custom teams, names of 1–40 characters, best-of-three finished scores (2–0, 2–1, 1–2, 0–2), or both scores cleared. Cutoffs must leave a playoff spot. Optional samples are 100–20,000; edits are capped at 400; streamed bodies and import files are capped at 64 KB. Match membership and duplicate unordered edits are validated. Reversed imported team order preserves score orientation.

JSON exports contain `version: 1`, the tool/league `kind`, and validated `input`. They are browser downloads, not account storage. Imports use the same rules as forms. Season changes may invalidate old match sets. Failed runs retain edits; superseded requests cannot replace current results.

## Verification

Run `npm test`, `npm run typecheck`, targeted ESLint on changed files, and `npm run build`. Contract tests use sanitized fixtures without network access. Review 390px, 768px and 1440px layouts, keyboard dialogs/focus, error/empty states and actual image loading. Verify production data and cache behavior after deployment; HTTP 200 and a Ready deployment alone do not prove live-source health.

Existing whole-repository lint failures are recorded separately in the tracker; they do not excuse new failures. Preserve user screenshots in `docs/screenshots` during planning-document cleanup.

API source and game artwork attribution remains visible in each new feature. This is an unofficial community frontend; data/artwork belongs to the respective source owners.
