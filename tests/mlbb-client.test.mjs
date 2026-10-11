import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadTs(file, dependencies, globals = {}) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    URL, Headers, Response, Request, TextDecoder, AbortSignal, Error, console, ...globals,
  });
  return exports;
}

function createClient(fetch, constants = {}) {
  const entries = new Map();
  const errors = loadTs("lib/mlbb/errors.ts", {});
  return loadTs("lib/mlbb/client.ts", {
    "@/lib/mlbb/errors": errors,
    "./constants": {
      DEFAULT_LANGUAGE: "en",
      DEFAULT_MLBB_API_BASE_URL: "https://arena.rone.dev/api",
      DEFAULT_MLBB_API_FALLBACK_BASE_URLS: [],
      MLBB_API_BASE_URL: "https://arena.rone.dev/api",
      MLBB_API_FALLBACK_BASE_URLS: [],
      ...constants,
    },
    "next/cache": {
      unstable_cache(fn, keys) {
        return async () => {
          const key = JSON.stringify(keys);
          if (entries.has(key)) return entries.get(key);
          const result = await fn();
          entries.set(key, result);
          return result;
        };
      },
    },
  }, { fetch });
}

const collection = { code: 0, message: "OK", data: { records: [{ data: { hero_id: 133 } }] } };

test("scenario body reader rejects oversized chunked requests before parsing", async () => {
  const { readScenarioBody, BodyTooLargeError } = loadTs("lib/mlbb/request-body.ts", {});
  const request = body => new Request("https://fixture.test/api/esports/custom/simulate", { method: "POST", body });
  const payload = await readScenarioBody(request('{"results":[]}'));
  assert.equal(payload.results.length, 0);
  await assert.rejects(readScenarioBody(request("x".repeat(65537))), BodyTooLargeError);
  await assert.rejects(readScenarioBody(request('{"name":"' + "😀".repeat(20000) + '"}')), BodyTooLargeError);
  await assert.rejects(readScenarioBody(request("invalid json")), /JSON|Unexpected/);
});

test("scenario validation rejects invalid scores, names, cutoffs, imports, and duplicate match edits", () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const standings = loadTs("lib/esports/standings.ts", { "@/lib/mlbb/records": records });
  const scenarios = loadTs("lib/esports/scenarios.ts", { "@/lib/mlbb/records": records, "./standings": standings });
  const fixture = name => JSON.parse(fs.readFileSync(new URL(`fixtures/rone/${name}.json`, import.meta.url)));
  for (const league of ["ph", "id"]) {
    const simulation = scenarios.readSimulation(fixture(`${league}Simulation`));
    const actual = standings.readStandings(fixture(`${league}Standings`));
    for (const row of simulation.standings) {
      const baseline = actual.find(team => team.team.name === row.team.name);
      assert.equal(row.points, baseline.points);
      assert.equal(row.net, baseline.net);
      assert.equal(row.wins, baseline.wins);
      if (row.rank !== baseline.rank) {
        assert.ok(["head_to_head", "unresolved"].includes(row.tiebreak));
        assert.ok(actual.some(other => other.rank === row.rank && other.points === row.points && other.net === row.net));
      }
    }
    assert.ok(simulation.matches.length > 0);
  }
  const custom = scenarios.readSimulation(fixture("customSimulation"));
  assert.equal(custom.teams, 4);
  assert.ok(custom.matches.length > 0 && custom.remaining > 0);
  const match = custom.matches[0];
  const input = { teams: ["Alpha", "Bravo", "Charlie", "Delta"], eliminated: 1, results: [{ ...match, score1: 2, score2: 1 }], model: "even", simulations: 100 };
  assert.equal(scenarios.validateScenario(input, true, custom.matches).results[0].score1, 2);
  assert.equal(scenarios.validateScenario({ ...input, results: [{ ...match, team1: match.team2, team2: match.team1, score1: 1, score2: 2 }] }, true, custom.matches).results[0].score1, 1);
  for (const invalid of [{ ...input, teams: ["Alpha", "alpha"] }, { ...input, eliminated: 4 }, { ...input, simulations: 99 }, { ...input, results: [{ ...match, score1: 1, score2: 1 }] }, { ...input, results: [{ ...match, score1: null, score2: 2 }] }, { ...input, results: Array(401).fill(match) }, { ...input, results: [{ ...match, score1: 2, score2: 0 }, { ...match, team1: match.team2, team2: match.team1, score1: 0, score2: 2 }] }]) assert.throws(() => scenarios.validateScenario(invalid, true));
  assert.throws(() => scenarios.validateScenario({ ...input, results: [{ ...match, week: 99 }] }, true, custom.matches));
  assert.equal(scenarios.validateScenario({ ...input, results: [{ ...match, score1: null, score2: null }] }, true).results[0].score1, null);
  assert.equal(scenarios.importScenario({ version: 1, kind: "custom", input }, "custom").teams.length, 4);
  assert.throws(() => scenarios.importScenario({ version: 2, kind: "custom", input }, "custom"));
  assert.throws(() => scenarios.importScenario({ version: 1, kind: "ph", input }, "custom"));
});

test("both esports contracts preserve league identifiers, missing scores, and player sequences", () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const standings = loadTs("lib/esports/standings.ts", { "@/lib/mlbb/records": records });
  const esports = loadTs("lib/esports/data.ts", { "@/lib/mlbb/client": {}, "@/lib/mlbb/errors": {}, "@/lib/mlbb/records": records, "./standings": standings }, { Intl });
  const fixture = name => JSON.parse(fs.readFileSync(new URL(`fixtures/rone/${name}.json`, import.meta.url)));
  for (const league of ["ph", "id"]) {
    const matches = esports.readSchedule(fixture(`${league}Schedule`), league);
    assert.ok(matches.length > 0);
    assert.ok(matches.filter(match => match.id).every(match => esports.matchIdentifier(league, match.id)));
    assert.ok(esports.readStandings(fixture(`${league}Standings`)).length > 0);
    const games = esports.readMatch(fixture(`${league}Match`));
    assert.ok(games.length > 0 && games[0].teams[0].players.length > 0);
    if (league === "ph") assert.ok(games[0].teams[0].players[0].sequence.length > 0);
  }
  assert.equal(esports.matchIdentifier("id", "ph-slug"), null);
  assert.equal(esports.matchIdentifier("ph", "../unsafe"), null);
  const upcoming = esports.readSchedule({ weeks: [{ week: 1, days: [{ matches: [{ score1: null, score2: null }] }] }] }, "ph")[0];
  assert.equal(upcoming.score1, null);
  assert.match(esports.manilaTime("2026-10-10T18:00:00Z"), /Oct 11/);
  assert.throws(() => esports.readStandings({ data: [] }));
  assert.throws(() => esports.readStandings({ standings: [null] }));
  assert.throws(() => esports.readStandings({ standings: [{ team: { name: "Alpha" } }, { team: { name: "alpha" } }] }));
  assert.throws(() => esports.readSchedule({ weeks: [{ week: 1, days: [{}] }] }, "ph"));
  assert.throws(() => esports.readSchedule({ weeks: [{ week: 1.5, days: [] }] }, "ph"));
});

test("wallpaper variants retain real dimensions, device selection, and multi-hero labels", () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const { normalizeWallpapers, galleryFilters } = loadTs("lib/wallpapers/gallery.ts", { "@/lib/mlbb/records": records, "@/lib/mlbb/public-data": {}, "@/lib/mlbb/errors": {} });
  const fixture = JSON.parse(fs.readFileSync(new URL("fixtures/rone/wallpapers.json", import.meta.url))).data.records;
  const desktop = normalizeWallpapers(fixture, "desktop");
  const mobile = normalizeWallpapers(fixture, "mobile");
  assert.equal(desktop.length, 2);
  assert.equal(mobile.length, 1);
  assert.match(desktop[0].title, /multi-hero/);
  assert.ok(desktop.every(entry => entry.variants.every(image => image.width >= image.height)));
  assert.ok(mobile.every(entry => entry.variants.every(image => image.height > image.width)));
  assert.equal(desktop[0].variants.at(-1).width, 2560);
  assert.equal(galleryFilters({ page: "999999" }).page, 1000);
  assert.equal(galleryFilters({ page: "bad", device: "bad" }).device, "desktop");
});

test("duration buckets retain open ranges and unavailable rates without confusing hero IDs", () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const { normalizeDuration } = loadTs("lib/academy/duration.ts", { "@/lib/mlbb/records": records });
  const fixture = JSON.parse(fs.readFileSync(new URL("fixtures/rone/duration.json", import.meta.url))).data.records;
  const duration = normalizeDuration(fixture, 108);
  assert.equal(duration.buckets.length, 6);
  assert.equal(duration.buckets.at(-1).label, "20+ min");
  assert.ok(duration.overall > 60 && duration.overall < 62);
  assert.equal(normalizeDuration(fixture, 1), null);
  const result = normalizeDuration([{ data: { heroid: 1, time_win_rate: [{ time_min: 14, win_rate: null }, { time_min: 0, time_max: 12, win_rate: 0 }, { time_min: 8, time_max: 6, win_rate: 0.5 }] } }], 1);
  assert.equal(result.buckets.length, 2);
  assert.equal(result.buckets[0].winRate, 0);
  assert.equal(result.buckets[1].winRate, null);
});

test("consecutive-win calculation returns the smallest answer and handles boundaries", () => {
  const { calculateConsecutiveWins: calculate } = loadTs("lib/tools/win-rate.ts", {});
  assert.equal(calculate({ matches: 100, current: 50, target: 60 }).wins, 25);
  assert.equal(calculate({ matches: 0, current: 0, target: 100 }).wins, 1);
  assert.equal(calculate({ matches: 100, current: 60, target: 50 }).wins, 0);
  assert.equal(calculate({ matches: 100, current: 99, target: 100 }).reason, "unreachable");
  for (const matches of [1, 100, 10000]) for (const current of [0, 33.33, 50, 99]) for (const target of [50, 60.5, 99.9]) {
    if (target <= current) continue;
    const result = calculate({ matches, current, target });
    const numerator = matches * (target - current);
    assert.ok(result.wins * (100 - target) >= numerator);
    assert.ok((result.wins - 1) * (100 - target) < numerator);
  }
  for (const input of [{ matches: -1, current: 50, target: 60 }, { matches: 1.5, current: 50, target: 60 }, { matches: 0, current: 50, target: 60 }, { matches: 100, current: 50, target: 0 }, { matches: 1000000, current: 0, target: 99.99999999999999 }]) assert.throws(() => calculate(input));
});

test("new public services validate before caching and fail over on malformed payloads", async () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  let requests = 0;
  const client = createClient(async (url, options) => {
    requests++;
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.cache, "no-store");
    return url.host === "arena.rone.dev" ? Response.json({ code: 0, data: null }) : Response.json(collection);
  }, { DEFAULT_MLBB_API_FALLBACK_BASE_URLS: ["https://arena.fastapicloud.dev/api"] });
  await client.fetchMlbbPublicResource("/academy/equipment", records.readCollection, { revalidate: 3600 });
  await client.fetchMlbbPublicResource("/academy/equipment", records.readCollection, { revalidate: 3600 });
  assert.equal(requests, 2);
});

test("public computations fail over without sharing cached POST results", async () => {
  let requests = 0;
  const client = createClient(async (url, options) => {
    requests++;
    assert.equal(options.method, "POST");
    assert.equal(options.body, JSON.stringify({ results: [] }));
    return url.host === "arena.rone.dev" ? new Response("Denied", { status: 403 }) : Response.json({ standings: [] });
  }, { DEFAULT_MLBB_API_FALLBACK_BASE_URLS: ["https://arena.fastapicloud.dev/api"] });
  const validate = value => { assert.ok(Array.isArray(value.standings)); return value; };
  for (const path of ["/esports/ph/standings/simulate", "/esports/id/standings/simulate", "/esports/standings/calculate"]) {
    for (let i = 0; i < 2; i++) await client.fetchMlbbPublicResource(path, validate, { body: { results: [] }, revalidate: 3600 });
  }
  assert.equal(requests, 12);
  await assert.rejects(client.fetchMlbbPublicResource("/user/auth/login", validate, { body: {} }), /Unsupported/);
  assert.equal(requests, 12);
});

test("every expansion GET uses canonical 403 fallback and caches only the validated result", async () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const standings = loadTs("lib/esports/standings.ts", { "@/lib/mlbb/records": records });
  const esports = loadTs("lib/esports/data.ts", { "@/lib/mlbb/client": {}, "@/lib/mlbb/errors": {}, "@/lib/mlbb/records": records, "./standings": standings }, { Intl });
  const fixture = name => JSON.parse(fs.readFileSync(new URL(`fixtures/rone/${name}.json`, import.meta.url)));
  const cases = [
    ["/academy/equipment/expanded", "items", records.readCollection],
    ["/academy/spells", "spells", records.readCollection],
    ["/academy/emblems", "emblems", records.readCollection],
    ["/academy/roles", "roles", records.readCollection],
    ["/academy/heroes/108/lane", "multiLane", records.readCollection],
    ["/academy/heroes/108/win-rate/timeline", "duration", records.readCollection],
    ["/heroes/wallpapers", "wallpapers", records.readCollection],
    ["/heroes/108/wallpapers", "wallpapers", records.readCollection],
    ["/esports/ph/schedule", "phSchedule", value => esports.readSchedule(value, "ph")],
    ["/esports/id/schedule", "idSchedule", value => esports.readSchedule(value, "id")],
    ["/esports/ph/standings", "phStandings", standings.readStandings],
    ["/esports/id/standings", "idStandings", standings.readStandings],
    ["/esports/ph/matches/rora-onic-20260821", "phMatch", esports.readMatch],
    ["/esports/id/matches/1036", "idMatch", esports.readMatch],
    ["/addon/win-rate-calculator", "calculator", value => { assert.equal(value.status, "success"); return value; }],
  ];
  for (const [path, name, validate] of cases) {
    const hosts = [];
    const client = createClient(async url => {
      hosts.push(url.host);
      return url.host === "arena.rone.dev" ? new Response("Denied", { status: 403 }) : Response.json(fixture(name));
    }, { DEFAULT_MLBB_API_FALLBACK_BASE_URLS: ["https://arena.fastapicloud.dev/api"] });
    await client.fetchMlbbPublicResource(path, validate, { revalidate: 300 });
    await client.fetchMlbbPublicResource(path, validate, { revalidate: 300 });
    assert.deepEqual(hosts, ["arena.rone.dev", "arena.fastapicloud.dev"], path);
  }
});

test("public operation boundaries include only approved computation POSTs", () => {
  const client = createClient(async () => Response.json(collection));
  for (const path of ["/academy/spells", "/heroes/88/wallpapers", "/esports/id/matches/1036", "/esports/ph/standings", "/addon/win-rate-calculator"]) assert.equal(client.isPublicMlbbOperation(path, "GET"), true);
  for (const path of ["/heroes", "/academy/spells", "/addon/ip", "/user/privacy/settings", "/esports/xx/standings/simulate"]) assert.equal(client.isPublicMlbbOperation(path, "POST"), false);
});

test("pagination tolerates source page limits, detects repeats, and preserves partial pages on error", async () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  for (const mode of ["complete", "repeat", "error"]) {
    let calls = 0;
    const data = loadTs("lib/mlbb/public-data.ts", {
      "./records": records,
      "./client": { fetchMlbbPublicResource: async (path) => {
        calls++;
        assert.equal(new URL(path, "https://fixture.test").searchParams.get("index"), String(calls));
        if (calls === 2 && mode === "error") throw new Error("Unavailable");
        return { total: 3, records: [{ id: mode === "repeat" ? 1 : calls, retrieved: calls }] };
      } },
    });
    const result = await data.getCompletePublicCollection("/academy/spells");
    assert.equal(result.partial, mode !== "complete");
    assert.equal(result.records.length, mode === "complete" ? 3 : 1);
    assert.equal(calls, mode === "complete" ? 3 : 2);
  }
});

test("Academy fixtures preserve talent/family identity and reject ambiguous name links", () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const academy = loadTs("lib/academy/normalizers.ts", { "@/lib/mlbb/records": records });
  const lanes = academy.unwrapLaneRecords([{ data: { hero: { data: { roadsort: [{ data: { road_sort_title: "Roam" } }, { data: { road_sort_title: "Exp Lane" } }, { data: { road_sort_title: "Gold Lane" } }, { data: { road_sort_title: "Mid Lane" } }] } } } }]);
  assert.equal(JSON.stringify(lanes), JSON.stringify(["roam", "exp", "gold", "mid"]));
  const fixture = name => JSON.parse(fs.readFileSync(new URL(`fixtures/rone/${name}.json`, import.meta.url))).data.records;
  const talents = academy.normalizeAcademyEntries("emblems", fixture("emblems"));
  const families = academy.normalizeAcademyEntries("emblems", fixture("roles"));
  assert.ok(talents.length > 0 && talents.every(entry => entry.id.startsWith("talent-")));
  const weakness = talents.find(entry => entry.id === "talent-1231");
  assert.equal(weakness.attributes, "");
  assert.match(weakness.description, /slow enemies by 50%/);
  assert.ok(families.length > 0 && families.every(entry => entry.id.startsWith("family-")));
  assert.ok(academy.normalizeAcademyEntries("items", fixture("items")).length > 0);
  const spells = academy.normalizeAcademyEntries("spells", fixture("spells"));
  assert.equal(spells.find(entry => entry.id === "20160").name, "Arrival");
  assert.equal(spells.find(entry => entry.id === "20080").name, "Purify");
  assert.ok(spells.every(entry => !entry.name.startsWith("@") && entry.image?.startsWith("https://")));
  assert.equal(academy.findCatalogEntry(spells, "Vengeance").id, "20190");
  assert.equal(JSON.stringify(academy.unwrapLaneRecords(fixture("multiLane"))), JSON.stringify(["roam", "exp"]));
  const duplicate = { ...talents[0], id: "talent-other" };
  assert.equal(academy.findCatalogEntry([...talents, duplicate], duplicate.name), null);
  assert.equal(academy.findCatalogEntry([...talents, duplicate], duplicate.name, duplicate.id).id, duplicate.id);
  assert.equal(records.percent(0), 0);
  assert.equal(records.percent(0.598), 59.8);
  assert.equal(records.percent(null), null);
});

test("hero build references preserve source identities and join the catalog without conflating talents", () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const academy = loadTs("lib/academy/normalizers.ts", { "@/lib/mlbb/records": records });
  const hero = loadTs("lib/hero/normalizers.ts", {});
  const fixture = name => JSON.parse(fs.readFileSync(new URL(`fixtures/rone/${name}.json`, import.meta.url))).data.records;
  const items = fixture("items"); const spells = fixture("spells"); const talents = fixture("emblems");
  // Construct a build from independently captured source entries to exercise the join.
  // This is not a captured recommendation for a particular hero.
  const [build] = hero.normalizeHeroBuildPlans({ data: { hero: { data: { recommendmasterplan: [{
    equiplist: items.map(record => record.data), battleskill: spells[0].data,
    emblemplan: { giftid1: talents[0].data },
  }] } } } });
  const itemCatalog = academy.normalizeAcademyEntries("items", items);
  const spellCatalog = academy.normalizeAcademyEntries("spells", spells);
  const talentCatalog = academy.normalizeAcademyEntries("emblems", talents);
  for (const item of build.items) assert.equal(academy.findCatalogEntry(itemCatalog, item.name, item.catalogId).name, item.name);
  assert.equal(academy.findCatalogEntry(spellCatalog, build.battleSpell.name, build.battleSpell.catalogId).name, "Arrival");
  const talent = build.emblem.talents[0];
  assert.ok(talent.catalogId.startsWith("talent-"));
  assert.equal(academy.findCatalogEntry(talentCatalog, talent.name, talent.catalogId).name, talent.name);
  assert.equal(academy.findCatalogEntry(talentCatalog, "Missing reference", "family-1221"), null);
});

test("catalog lookups distinguish outages from absent identities and do not cache error states", async () => {
  const records = loadTs("lib/mlbb/records.ts", {});
  const academy = loadTs("lib/academy/normalizers.ts", { "@/lib/mlbb/records": records });
  const cache = loadTs("lib/mlbb/cache.ts", {});
  let catalog = { available: false, partial: true, entries: [] };
  const route = loadTs("app/api/academy/[kind]/route.ts", {
    "@/lib/academy/catalog": { getAcademyCatalog: async () => catalog },
    "@/lib/academy/normalizers": academy, "@/lib/mlbb/cache": cache,
  });
  const context = kind => ({ params: Promise.resolve({ kind }) });
  const request = new Request("https://site.test/api/academy/spells?name=Arrival");
  const outage = await route.GET(request, context("spells"));
  assert.equal(outage.status, 503);
  assert.equal(outage.headers.get("Cache-Control"), "no-store");
  catalog = { available: true, partial: false, entries: [] };
  const missing = await route.GET(request, context("spells"));
  assert.equal(missing.status, 200);
  assert.equal((await missing.json()).entry, null);
  catalog.partial = true;
  const incomplete = await route.GET(request, context("spells"));
  assert.equal(incomplete.headers.get("Cache-Control"), "no-store");
  const invalid = await route.GET(request, context("unknown"));
  assert.equal(invalid.status, 404);
  assert.equal(invalid.headers.get("Cache-Control"), "no-store");
});

test("API errors and malformed collections retry and recover without caching failures", async () => {
  for (const failure of [{ code: 1001, message: "Unavailable" }, { code: 0, data: null }]) {
    let requests = 0;
    const client = createClient(async (url, options) => {
      assert.equal(url.origin, "https://arena.rone.dev");
      assert.equal(options.cache, "no-store");
      assert.equal(options.next, undefined);
      return Response.json(++requests === 1 ? failure : collection);
    });
    await assert.rejects(client.fetchMlbbCollection("/heroes", { revalidate: 3600 }));
    const recovered = await client.fetchMlbbCollection("/heroes", { revalidate: 3600 });
    assert.equal(recovered.data.records[0].data.hero_id, 133);
    await client.fetchMlbbCollection("/heroes", { revalidate: 3600 });
    assert.equal(requests, 2);
  }
});

test("rank filters get separate cache entries", async () => {
  let requests = 0;
  const client = createClient(async () => { requests++; return Response.json(collection); });
  for (const rank of ["all", "glory", "all"]) {
    await client.fetchMlbbCollection("/heroes/rank", { revalidate: 3600, searchParams: { rank } });
  }
  assert.equal(requests, 2);
});

test("uncached and authenticated requests always retry the source", async () => {
  let requests = 0;
  const client = createClient(async () => { requests++; return Response.json(collection); });
  for (const options of [{ revalidate: 0 }, { revalidate: 3600, headers: { authorization: "Bearer test" } }]) {
    await client.fetchMlbbCollection("/heroes", options);
    await client.fetchMlbbCollection("/heroes", options);
  }
  assert.equal(requests, 4);
});

test("partial data and snapshots never receive shared cache lifetimes", () => {
  const { publicDataCacheControl } = loadTs("lib/mlbb/cache.ts", {});
  assert.equal(publicDataCacheControl(true, 3600), "no-store");
  assert.match(publicDataCacheControl(false, 3600), /s-maxage=3600/);
});

test("failure logs identify upstream status and network cause without credentials or queries", () => {
  const logs = [];
  const { MlbbApiError, reportMlbbCollectionFailure } = loadTs("lib/mlbb/errors.ts", {}, {
    console: { error: (...args) => logs.push(args) },
  });
  reportMlbbCollectionFailure("/heroes?token=private", new MlbbApiError("Unavailable", {
    status: 403,
    url: "https://user:password@arena.rone.dev/api/heroes?token=private",
    cause: { code: "EAI_AGAIN" },
  }));
  assert.equal(logs[0][1].upstreamHost, "arena.rone.dev");
  assert.equal(logs[0][1].endpoint, "/heroes");
  assert.equal(logs[0][1].status, 403);
  assert.equal(logs[0][1].networkCode, "EAI_AGAIN");
  assert.doesNotMatch(JSON.stringify(logs), /password|token|private/);
});

test("public hero feeds recover from canonical-host 403 using the provider backup", async () => {
  const requests = [];
  const client = createClient(async (url) => {
    requests.push(url.toString());
    return url.host === "arena.rone.dev"
      ? new Response("Forbidden", { status: 403 })
      : Response.json(collection);
  }, { DEFAULT_MLBB_API_FALLBACK_BASE_URLS: ["https://arena.fastapicloud.dev/api"] });
  for (const endpoint of ["/heroes", "/heroes/positions", "/heroes/rank", "/heroes/108"]) {
    const result = await client.fetchMlbbCollection(`${endpoint}?lang=en`, {
      revalidate: 3600, searchParams: { rank: "glory" },
    });
    assert.equal(result.code, 0);
  }
  assert.equal(requests.length, 8);
  assert.ok(requests.every((url) => url.includes("lang=en") && url.includes("rank=glory")));
  assert.equal(new URL(requests[1]).host, "arena.fastapicloud.dev");
});

test("authenticated GET and POST requests stop on 403", async () => {
  const requests = [];
  const client = createClient(async (url) => {
    requests.push(url.toString());
    return new Response("Forbidden", { status: 403 });
  }, { DEFAULT_MLBB_API_FALLBACK_BASE_URLS: ["https://arena.fastapicloud.dev/api"] });
  await assert.rejects(client.fetchMlbbQuery("/user/info", { jwt: "test" }));
  await assert.rejects(client.fetchMlbbMutation("/user/auth/login", { body: { vc: 123 } }));
  await assert.rejects(client.fetchMlbbCollection("/heroes", { headers: { authorization: "Bearer test" } }));
  assert.equal(requests.length, 3);
  assert.ok(requests.every((url) => new URL(url).host === "arena.rone.dev"));
});
