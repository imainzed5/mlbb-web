import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

test("public timestamps hydrate identically across server/browser timezone defaults", () => {
  const source = fs.readFileSync(new URL("../lib/date-time.ts", import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const script = `${output}\nprocess.stdout.write(exports.formatPublicTimestamp('2026-10-11T16:46:00Z'));`;
  const values = ["UTC", "America/Los_Angeles", "Asia/Manila"].map(TZ =>
    execFileSync(process.execPath, ["-e", script], { env: { ...process.env, TZ }, encoding: "utf8" })
  );
  for (const value of values) assert.equal(value, "Oct 12, 2026, 12:46 AM (UTC+8)");
});
