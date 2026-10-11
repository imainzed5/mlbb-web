# Rone expansion verification

Local release review: October 12, 2026, Asia/Manila.

## Release checks

- `npm test`: 21/21 pass, including public/private fallback boundaries, validation before caching, pagination/partial responses, streamed request limits, both league contracts, stable catalog/build IDs, duration fractions/ranges, source image variants, scenario input rules and minimal integer win-rate mathematics.
- Typecheck and targeted ESLint for changed/new files: pass. Existing whole-repository lint baseline remains outside this release; its observed counts are recorded below.
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

## Production verification

Vercel Production deployment `6998598370`, commit `44efa10e628dce47f771869b65bb1aa6efd2cbcd`, completed successfully. Canonical site: https://mlbbstats-snowy.vercel.app.

- Live catalog routes: 152 items, 12 spells, 33 emblem/talent entries, all available. Item 3573 resolves to Demon Boots - Favor, spell 20160 to Arrival, and talent-1221 to Weapons Master, with descriptions and HTTPS icons. Browser spell names are resolved and six observed spell icons loaded.
- Duration API returns six Aulus Jungle buckets. Browser Gatotkaca Roam chart/table loads, and changing to EXP/Mythic retains URL context and returns 45.0% overall. Existing daily trends, counters and teammates also render. Gatotkaca has no published build; no recommendation was fabricated. Build component identity/dialog behavior is covered by the captured-data harness and contract test noted above.
- Browser consecutive-win form returns 25 wins, 125 matches and approximately 60%, labeled as a provider result checked locally. Screenshot: `production-win-rate.jpg`.
- All three scenario APIs return successful uncached computations. PH result flip changes RORA 9→10 and ONIC 9→8; ID flip changes EVOS 7→6 and RRQ 3→4; custom edits affect the correct teams. Browser custom generation/edit/reset and ID real-result edit/comparison work. Duplicate names and invalid lanes return 400/no-store; oversized scenario body returns 413/no-store.
- Both league pages and completed-match pages return real content without unavailable states. ID game switch changes duration 16:51→24:40; PH game switch retains week 1 and shows source player/purchase-sequence data. Eight observed images loaded on each match page. ID week 9 shows eight upcoming matches without invented scores or detail links.
- Hero gallery/viewer images load, source links expose 1920×1080 and 2560×1440, and Escape restores focus. Global mobile gallery has 45 records, page 2 changes artwork and retains device/page; desktop has 1152 records. Four observed mobile images loaded.
- Home, Heroes, Rank, Meta, Account, Tools and both leagues return 200 with appropriate canonical metadata. Custom scenario page is noindex. Sitemap includes stable Academy details and excludes simulator states.
- Whole-repository ESLint baseline rechecked: 84 errors and 1 warning before the subsequent timestamp/chart repair. These are pre-existing failures; touched files must pass targeted lint.

Hydration repair verified on Production deployment `6998749847`, commit `213ece4ed6e6827eaabcae57ccd5eeacf759a216`: hero/meta use shared explicit Asia/Manila timestamps with a UTC+8 label. A new test proves identical output under UTC, America/Los_Angeles and Asia/Manila (22 total tests pass). Chart initial dimensions and UTC date-only labels were corrected; targeted lint and the exact-source production build pass. Fresh full-page hero/meta loads and lane/rank/15-day trend interactions produced no new browser errors or warnings. Both hero sync labels agree and filtered duration data remains 45.0%. Meta Jungle returns 36 heroes. PH simulator browser baseline preserves all published team points and explains the two tied ranks.

Final tooltip polish passed targeted lint and the production build, then deployed successfully as `6be24b16a4318145bbb7d9ab37ff1eb4a4305f92` (Production deployment `6998821311`). Browser chart tooltip displays `40.3%` with site colors, matching its table; filtered EXP/Mythic overall remains 45.0%. Fresh browser diagnostics after this deployment contain no errors/warnings. Screenshot: `production-hero-duration.jpg`.

## Completion and documentation cleanup

All six requested feature families are implemented and production-verified, with desktop/mobile discovery, source contracts, failure states and existing-route regression checks recorded above. The final automated suite has 22 passing tests; typecheck, touched-file lint and exact-source production build pass. Existing unrelated whole-repository lint failures remain outside this release.

Durable routes, cache/fallback rules, assumptions and maintenance commands are in `docs/rone-api-integration.md`; this report retains verification evidence and source limitations. Only the two temporary planning documents were removed after this migration. All user files under `docs/screenshots/` and these QA artifacts were preserved. Cleanup changes documentation only; runtime code remains the production-verified `6be24b1` implementation.
