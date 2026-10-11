# Rone API expansion tracker

Plan: [implementation plan](./rone-api-expansion-plan.md).

Created October 11, 2026, Asia/Manila. Reviewed October 12, 2026. Status: implementation resumed under the active expansion goal. No feature work is marked complete by writing these documents.

Working-tree inventory: foundation adapters, fixtures and contract tests are in local commit `be7e01c`; feature routes, components, navigation and later fixes remain uncommitted. Some local checks are recorded below, but the complete acceptance and production checks remain open. Treat drafts as candidate implementation, not completed deliverables. Audit them first when implementation is requested; do not reset or discard unrelated work.

## How to resume

1. Read the plan and repository `AGENTS.md`; check current Git status and installed Next.js guides.
2. Start with the first incomplete phase below. Recheck the relevant upstream contracts.
3. Implement a reviewable phase, verify its acceptance criteria, and record evidence here.
4. Keep unrelated changes separate. Preserve existing `docs/screenshots/` files.
5. Follow the user's current release instructions. Record a production result only after verifying the deployed behavior.

## Phase status

| Phase | Dependency | Status | Commit / evidence |
| --- | --- | --- | --- |
| 0. API foundation and representative fixtures | None | Verified locally; production gate open | Latest recorded suite: 21 tests; expansion GET/POST fallback paths, validation and pagination checks; revalidate final changes |
| 1. Items, spells, emblems, build links | 0 | Reviewed locally; production gate open | 98e881f; catalog/detail/filter and fixture build-dialog checks below |
| 2. Hero duration statistics | 0 | Reviewed locally; production gate open | 98e881f; single/multi-lane data, URL state, chart/table and outage checks |
| 3. Tools and win-rate calculator | 0 | Reviewed locally; production gate open | 98e881f; boundary matrix, provider agreement and unreachable UI |
| 4. Wallpaper galleries | 0 | Reviewed locally; production gate open | 98e881f; global paging/viewer and hero source-resolution image checks |
| 5. Esports hub and match details | 0; reuse 1 for item details | Reviewed locally; production gate open | b49573d; both leagues, completed/upcoming states, game switching and week context |
| 6. Playoff and custom league simulators | 5 | Reviewed locally; production gate open | b49573d; real score edits, reset, custom imports/exports, server input limits |
| 7. Navigation, discovery, production QA | Incremental through 1–6 | Local regression reviewed; production pending | Desktop/mobile navigation, discovery and metadata; production checks open |
| 8. Durable documentation and cleanup | All features verified | Planned | — |

## Required deliverables

- [x] Public fallback policy extended with authenticated-request boundary tests.
- [x] Structured esports and addon adapters; validated collection loaders.
- [x] Bounded requests, pagination, and cache/error behavior verified locally; production data health remains a separate gate.
- [ ] Item catalog and stable detail routes.
- [ ] Battle spell catalog and details.
- [ ] Emblem/talent explorer and details with verified identity relationships.
- [ ] Build entry inspection and correct catalog links.
- [ ] Hero duration section with lane/rank URL state and chart/table.
- [ ] Tools hub and verified consecutive-win calculator edge cases.
- [ ] Global and hero wallpaper galleries with working full-image links.
- [ ] Philippine schedules, standings, and match details.
- [ ] Indonesian schedules, standings, and match details.
- [ ] Real-league playoff scenario tool with reset and comparison.
- [ ] Custom league calculator with validated team/result input.
- [ ] Desktop/mobile discovery, metadata, sitemap, attribution, and accessible controls.
- [ ] Relevant tests, typecheck, targeted lint, and production build pass.
- [ ] Both leagues, hero integrations, calculators, and galleries verified on Vercel.
- [ ] Existing home/heroes/rank/meta/account routes checked for regressions.
- [ ] Durable docs updated and temporary planning files removed after completion.

## Evidence already established before implementation

- Production public requests to the canonical API previously returned 403; the provider backup restored live hero data. Existing fix: `8ccc1ac`.
- On October 11, 2026, expanded equipment, spells, emblems, Aulus lane/duration data, and PH standings returned data through the backup.
- The Academy builds route requires lane and warns of historical compatibility use; keep it out of automatic replacement of current builds.
- Esports objects and addon calculator results require separate response adapters.
- Existing `/tools` redirects home; existing mobile navigation has five slots.

These are baseline observations, not completed expansion tasks. Recheck changing API behavior when implementing.

## Decisions and unresolved contract checks

| Question | Default / action | Resolution evidence |
| --- | --- | --- |
| Navigation | Desktop Explore menu; mobile Explore slot contains Rank and new sections | Phone Escape/focus and links reviewed; remaining regression checks below |
| Item/talent identity | Prefer stable upstream IDs; only unique-name fallback | Captured catalog fixtures joined through actual build normalizer; item/spell/talent dialogs and IDs verified |
| Simulation response fields | Inspect current schema plus representative POST results | PH/ID/custom fixtures and live computations inspected; provider tied-rank difference explained |
| Duration range semantics | Label observational duration statistics | Real Aulus/Gatotkaca buckets tested; open range retained; inclusivity/sample size not inferred |
| Calculator rounded win rates | Label estimate; test boundary math and 100% cases | Minimal integer matrix tests and unreachable target UI verified |
| Cross-origin image download | Full-image links and browser save action | Viewer exposes actual variants; cross-origin forced download omitted |
| Season/week changes | Derive from source, avoid hardcoded season assumptions | Source weeks/identifiers; match navigation now preserves selected week |

## Verification record template

### Production audit and hydration repair — October 12, 2026

- Release pushed to main; GitHub/Vercel Production deployment `6998598370` successfully deployed `44efa10`. Detailed route, data, image, calculator, scenario and metadata evidence migrated to `docs/qa/rone-expansion-verification.md`.
- Production browser diagnostics exposed hero timestamp text hydration error 418: Vercel server and browser default timezones disagreed. Shared explicit UTC+8 timestamp formatting now covers hero server/client and meta client. Added a three-timezone regression test: total 22/22 tests pass.
- Chart date-only ticks now use UTC and ResponsiveContainer has positive initial dimensions. Replaced the existing chart mount effect with hydration-aware external-store snapshots; included missing hero refresh dependencies. Targeted lint and final exact-source build are running. Do not deploy an unverified fix or remove temporary docs before the repaired production render is checked.
- Whole-repo lint recheck before these repairs: 84 pre-existing errors, 1 warning. Production source API and new computations were healthy during this audit; provider-specific missing hero builds and PH duration/winner values remain explicitly unavailable rather than invented.
- Exact-source production build after all timestamp/chart/hook edits passed (26 static entries), and targeted lint passed for all touched repair files. The 22-test suite passed. Deploy the repair next, then use fresh-tab hero/meta diagnostics to verify hydration before cleanup.

### Final local validation and release preparation — October 12, 2026

- Resumed the full implementation goal after the documentation-only checkpoint. Existing drafts were preserved and reviewed; production and cleanup gates remain open.
- Revalidated the pending lint/typecheck process: exit 0. Re-ran the complete 21-test suite: all pass. Final production build after the Academy 503/no-store and duration input-header changes: pass, 26 static entries, no upstream diagnostic failures in this build output.
- Desktop 1440px review: account connection form renders without changing authentication; Explore exposes Rank, Academy, Esports, Tools and Wallpapers, and Escape restores trigger focus. Homepage shows live Aulus 59.8% and six observed images loaded successfully, plus all four new discovery cards; no horizontal overflow.
- Hero browser search for Gatot returns the correct single hero. Rank search for Aulus and Ban rate sorting retain the correct single result. Meta Jungle filter shows 36 heroes and updates lane context; at 390px, page width is 380px. Mobile Explore retains five primary slots and all section links.
- Remaining release work: review/stage feature groups, push the authorized release, verify deployed commit and all feature families on production, migrate durable evidence, then remove only the two temporary planning files.
- Mobile Academy family filter/search resolves Assassin emblem to `family-20005`, retains query/category on Back, renders a loaded icon and source attributes, and uses a canonical URL without query parameters. Page width 380px at a 390px viewport; screenshot `docs/qa/emblem-family-mobile.jpg`.
- Feature groups committed as `98e881f` (Academy/duration/calculator/galleries) and `b49573d` (esports/scenarios). Foundation is `be7e01c`. No production verification is claimed by these local commits.

### Current documentation-only checkpoint — October 12, 2026

- Reviewed the existing plan, progress tracker, integration notes, working-tree inventory and local commit history for the user's plan-first request.
- Preserved all existing feature drafts and prior dated evidence. Updated the current status to distinguish planning review from implementation and production completion.
- Canonical Swagger fetch timed out; the upstream public esports router on GitHub was accessible. Recheck current schemas and representative responses when implementation resumes.
- This checkpoint changes only the plan and tracker. It does not run feature tests, implement code, commit, push, deploy or remove documents.
- Next implementation step: audit the foundation and existing drafts, then address the first unmet acceptance criteria in phase order. Keep release and cleanup gates open until the deployed features are verified.

### Release audit — October 12, 2026

- Added a build-to-catalog integration test using a synthetic recommendation assembled from captured item/spell/talent entries. It verifies preserved IDs and the talent namespace; it is not a claimed live hero recommendation.
- A temporary local build-card harness verified item effects and `/academy/items/3573`, Arrival spell effects and `/academy/spells/20160`, Weapons Master talent effects and `/academy/emblems/talent-1221`. Escape restored item-button focus; full-reference navigation opened the talent detail. Harness file removed before release. Screenshot: `docs/qa/build-talent-dialog.jpg`.
- Added a fixture matrix proving canonical 403 fallback and cache reuse for every expansion GET. Extended computation tests to both real leagues and the custom calculator. Latest test count: 20, all passing. All changed/new TypeScript and test files passed targeted ESLint; typecheck passed.
- PH phone standings/schedule fit 390px (page width 380px). Selected week carried into match links, Game 2, and the Back link. ID phone standings/schedule also fit, showing nine teams and eight upcoming matches; upcoming NAVI–RRQ correctly displays no result and no unavailable detail link.
- Standings now reject missing/duplicate team identities; schedule parsing rejects malformed day arrays and noninteger weeks before caching. Added regression assertions. Wallpaper failures now use the sanitized shared diagnostic helper.
- Latest production build passed with 26 static entries and no temporary harness route. Limited provider rate-limit diagnostics remain during shared hero/catalog prerender work. No deployment or production completeness is claimed yet.
- Foundation committed locally as `be7e01c` (adapters, normalized identities, transport, fixtures, contract tests and planning/integration docs); not pushed yet.
- ID simulator phone check changed Week 1 EVOS–RRQ from 2–0 to 0–2; provider standings showed EVOS 7→6 and RRQ 3→4, with other team points unchanged. Reset restored 2–0. Both leagues' phone pages and simulator fit within 390px.
- Catalog API now returns 503/no-store for complete source outages instead of a misleading successful missing-entry result. Added route-level outage/missing/partial/invalid-kind checks; duration input errors also explicitly use no-store. Latest tests: 21/21 pass.

### Implementation and UI review — October 12, 2026

- Current `npm test`: 18/18 pass; `npm run typecheck`: pass. The latest production build passed, with upstream timeout/revalidation diagnostics during prerendering. It preceded the final spell and freshness-label edits, so the final release still needs a build. Targeted ScenarioBuilder lint passed.
- Browser wallpaper checks: desktop viewer image loaded, 1920×1080 and 2560×1440 source links present, Escape closed the viewer and restored card focus. Mobile filter and Next page preserved `device=mobile&page=2` and changed artwork. Global source totals observed: 1152 desktop / 45 mobile records.
- Browser hero checks: Gatotkaca published Roam/Exp lanes. Switching to EXP and Mythic updated the URL and returned a six-bucket chart/table with overall 45.0%; the core hero content remained usable. Phone page did not overflow.
- Browser calculator check: 100 matches / 50% / 100% displays the unreachable-target explanation and local-calculation assumption.
- Browser esports checks: PH game switching changed Game 1 to Game 2 and player data; purchase sequence showed source timeline percentages. ID match 1036 showed duration 16:51, winner/defeated states and player/item data. First eight observed ID images loaded successfully; tablet page did not overflow. Screenshot: `docs/qa/id-match-tablet.jpg`.
- Maximum custom team names exposed a phone overflow defect (390px viewport, 449px page). Added wrapping and a constrained grid column; recheck showed page width 380px and match labels within their 306px containers. Oversized names rejected; 40-character names generated a two-team schedule. Screenshot: `docs/qa/custom-long-names-mobile.jpg`.
- Spell catalog exposed unresolved top-level reference strings. Normalization now uses resolved `__data` name/icon values, retaining a direct-name fallback only when it is not a reference. Added fixture assertions for Arrival, Purify, Vengeance, image URLs, and real multi-lane labels. Browser reload shows all 12 proper spell names; Purify search preserves its query in the detail link.
- Purify detail opened with readable effects and working icon; the Back link restored `query=Purify`. Weakness Finder detail opened with readable multiline effects, a working icon and a canonical URL without filter parameters. Removed talent `numdescribe` substitution lists from the Attributes field: resolved effects already explain those values.
- Masha encountered an actual upstream outage during the build's source traffic: duration showed a retry state, artwork kept its gallery link, and the core hero page remained navigable. This proves graceful failure, not completeness of Masha's live data or build dialogs.
- Removed redundant hero `generateStaticParams` after the build enumerated 159 pages and logged 141 source revalidation failures/rate limits. Hero pages already render dynamically; the installed Next guide confirms enumeration is for build-time generation. A follow-up build is checking that the change removes that source amplification without changing hero routes.
- Follow-up production build: pass, 26 static entries instead of 159; hero/detail/gallery/OG routes remain dynamic. Source 429 diagnostics remain for limited shared catalog/rank work during the provider's rate-limit window, so this is not a clean live-data health result. Latest tests 18/18, typecheck and targeted ESLint (including hero page): pass. Spell screenshot: `docs/qa/spells-tablet.jpg`. Viewport reset after testing.
- Added durable `docs/rone-api-integration.md` and fixture provenance notes. Changed esports freshness text to distinguish view load time from source sync and explain the five-minute cache.
- Prior simulator evidence remains applicable pending final code review: local invalid payloads returned 400/413 with no-store; PH score change updated the correct teams; custom reset, reversed-team JSON import and exported versioned payload were inspected. Published PH ranks differ from provider simulation only on tied records; comparison retains both and explains provider tiebreak ordering.
- All expansion code remains uncommitted and undeployed. Required remaining work: complete Academy build/dialog and emblem/detail review, gallery hero/image/error checks, PH/ID schedule and simulator regression review, final targeted lint/typecheck/build, release commits/push, production evidence, and temporary-doc cleanup.

### Planning review — October 12, 2026

- Reopened the canonical Swagger page and OpenAPI schema (version 1.2.3) and inventoried the current working tree.
- Clarified the distinction between the original site baseline, existing local drafts, and accepted/deployed deliverables.
- Added phase checkpoints, dependency order, and release/documentation boundaries to the plan.
- Updated phases 6 and 7 to acknowledge existing drafts without marking them complete.
- This review edits only these two planning documents. No new implementation, test execution, commit, push, or deployment is claimed. Earlier dated evidence remains historical and should be revalidated against the final code.
- Next implementation action: audit the drafts and Phase 0 contract/transport checks, then work through the first unmet acceptance criteria. The earlier "Next work" entry below describes its historical checkpoint, not the current inventory.

### Implementation evidence — October 11, 2026

- Shared public transport now validates new resource shapes before caching, bounds attempts/timeouts, and permits fallback for the two public simulation computations while retaining private 403 boundaries. Existing client tests now include `AbortSignal` in their runtime harness.
- Pagination continues when the provider limits page size below the requested size, detects duplicate/repeated records, and preserves earlier records with a partial status when a later page fails.
- Academy hub/catalog/detail routes and lazy build-reference dialogs are implemented. Known IDs are preserved; unknown build references use unique-name matching. Talent gift IDs remain separate from emblem-family IDs. Catalog filters follow URL state.
- Local live catalog probes returned 152 items, 12 spells, and 33 family/talent entries, all `available: true`, `partial: false`; the item catalog rendered HTTP 200 with Equipment content.
- Hero duration module loads independently, shares rank context and uses a lane URL filter, guards superseded requests, and includes a chart/table. Aulus jungle probe returned six valid buckets, including `20+ min`, and overall 61.7321%. No interval-inclusivity or sample-size claims are made.
- Tools hub and win-rate calculator implemented. Local math validates inputs, unreachable 100% targets, zero matches, minimal integer answers, and excessive numerical precision. Provider result is used only when it agrees with local math. Live probe: 100 matches / 50% / 60% => 25 wins, 125 total, provider source.
- Global and hero wallpaper galleries provide device/page URL filters, real source resolution links, deduplicated variants, dialog viewer, image-error state, and a streamed hero preview. Multi-hero/event artwork is labeled. Local mobile gallery and Aulus gallery returned HTTP 200 with no unavailable state.
- Esports hub, PH/ID schedules and standings, and completed-match pages implemented. IDs are league-specific; null scores stay unknown. Times use Asia/Manila. Match pages show available game/player/team data and PH purchase sequences. Item links require a catalog ID match; unknown assets remain source IDs. Live pages `/esports/ph`, `/esports/id`, `/esports/ph/matches/rora-onic-20260821`, and `/esports/id/matches/1036` returned HTTP 200 without an unavailable state.
- `npm test`: 16/16 pass, covering new fixtures/contracts, pagination, public/private fallback boundaries, calculator mathematics, duration ranges, wallpaper dimensions/device filtering, esports identifiers, missing scores, and timezone conversion.
- `npm run typecheck`: pass. Targeted ESLint for all newly added modules/routes/components: pass. `npm run build`: pass, including all current new routes.
- All implementation changes are local/uncommitted. No expansion phase is marked complete: desktop/mobile/keyboard checks, full error-state review, regression checks, and production verification remain outstanding.
- Next work: Phase 6 simulators (strict server validation, reset/baseline comparison, estimates, custom teams/results, versioned JSON import/export), then Phase 7 navigation/metadata/sitemap/discovery and comprehensive UI QA. Reinspect the simulation schemas via the backup/source repository if the canonical docs return an upstream error; the last canonical schema request returned error 1101.
- Development server is running on port 3010 (exec session 38965). Before starting a replacement, verify whether that session/port is still live. No build or lint process remains intentionally pending.

### Planning review — October 11, 2026

- Rechecked the live OpenAPI 1.2.3 endpoint list and current navigation/Tools route.
- Documented the six-feature scope, supporting endpoints, and follow-up candidates explicitly in the plan.
- Recorded existing draft code without marking any phase complete.
- This review changes planning documents only. No implementation, commit, push, deployment, or feature verification is claimed.

For each phase, add a dated entry with:

- Completed user-visible behavior and acceptance items.
- Relevant files and commit, when committed.
- Commands/tests and observed outcome; identify pre-existing failures separately.
- API fixtures or live probes and any normalization decisions.
- Desktop/mobile/keyboard findings and repairs.
- Production URL, deployed commit, and data/image health results when deployed.
- Remaining issues and the next concrete phase.

## Cleanup record

Populate only after all required deliverables are verified. List where durable notes were migrated, verify no remaining links point to these temporary files, then remove these two planning documents only. Preserve user screenshots and other documentation.
