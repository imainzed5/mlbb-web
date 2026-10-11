# Rone expansion verification

Local release review: October 12, 2026, Asia/Manila.

## Release checks

- `npm test`: 21/21 pass, including public/private fallback boundaries, validation before caching, pagination/partial responses, streamed request limits, both league contracts, stable catalog/build IDs, duration fractions/ranges, source image variants, scenario input rules and minimal integer win-rate mathematics.
- Typecheck and targeted ESLint for changed/new files: pass. Existing whole-repository lint baseline remains outside this release; see the temporary tracker until cleanup.
- Final `npm run build`: pass after the final Academy outage/status and duration cache-header changes. 26 static entries; dynamic hero and feature routes listed correctly. No upstream errors appeared in this build output. This is a build result, not proof of production data health.

## Local browser evidence

| Area | Verified behavior |
| --- | --- |
| Academy | 152 items, 12 resolved spell names, 33 family/talent entries; item, spell and talent detail effects; stable namespaces; filtered Back links; canonical query omission; mobile family detail image loaded |
| Build inspection | Synthetic recommendation built from captured source entries; real build normalizer and component preserve item/spell/talent IDs; dialogs open effects/full reference; Escape restores focus. This harness was removed; it is not a claimed live hero build |
| Duration | Aulus Jungle six buckets and open 20+ range; Gatotkaca Roam/Exp, EXP Mythic 45.0% with chart/table and URL context; observed outage retry remains independent of core hero content |
| Win-rate | Provider-checked 100/50/60 returns 25; 100/50/100 unreachable explanation; strict boundary/minimality tests and labeled local fallback |
| Wallpapers | Desktop/mobile filters, mobile page 2 changes artwork, native dialog Escape/focus, true resolution links; Gatotkaca desktop gallery has 10 hero-tagged entries and a source image loaded at 2560×1440 |
| Esports | Both leagues render standings/schedules on phone; PH week survives match/game/back navigation; PH game switch and source purchase percentages; ID completed match 1036 duration 16:51, source player/items and loaded images; upcoming matches retain unknown scores/no fabricated detail links |
| Scenarios | PH and ID edited result affects the correct teams; reset restores actual result; custom generation/reset/versioned JSON export/import including reversed teams; bounded server validation and 64 KB body limits; longest permitted names wrap on phone |
| Existing routes | Home shows live Aulus 59.8% and loaded images; hero search, rank search/sort and meta Jungle filter work; anonymous account connect page renders. No account messages sent or authentication state changed |
| Discovery | 1440px desktop Explore and 390px five-slot mobile navigation; all section links; Escape focus return; homepage cards; canonical links and noindex scenario metadata reviewed in code/build |

Screenshots in this folder accompany the detailed tracker. Tested layouts include 390px, 768px and 1440px. Source outages observed during earlier checks remained explicit optional-module states. Source retrieval/cache time is not advertised as a source sync timestamp.

## Provider limitations

No-edit simulation preserves team records but can reorder published tied ranks using the provider's tiebreak calculation. The UI retains both published and scenario ranks and explains this difference; it must not invent a local tiebreaker. Historical Academy builds do not replace the preferred hero build feed. Rounded win-rate inputs remain estimates, and duration buckets have no inferred sample size or interval-inclusivity claims.

## Production gate

Pending: release push, deployed commit confirmation, and production checks for every feature family, core routes, images, cache/error behavior and computations. Keep the temporary plan/tracker until these checks pass and durable notes have been migrated. Preserve user files under `docs/screenshots/`.
