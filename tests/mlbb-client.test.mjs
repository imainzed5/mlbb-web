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
    URL, Headers, Response, Error, console, ...globals,
  });
  return exports;
}

function createClient(fetch) {
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
