"use client";

import { useEffect, useRef, useState } from "react";
import { actionClass, fieldClass, panelClass } from "@/components/explore/ExploreShell";
import type { WinRateResult } from "@/lib/tools/win-rate";

export function WinRateCalculator() {
  const [result, setResult] = useState<WinRateResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    controller.current?.abort();
    const next = new AbortController(); controller.current = next;
    setBusy(true); setError(""); setResult(null);
    try {
      const query = new URLSearchParams({ matches: String(fields.get("matches")), current: String(fields.get("current")), target: String(fields.get("target")) });
      const response = await fetch(`/api/tools/win-rate?${query}`, { signal: next.signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Calculation unavailable.");
      if (!next.signal.aborted) setResult(payload);
    } catch (error) { if (!next.signal.aborted) setError(error instanceof Error ? error.message : "Calculation unavailable."); }
    finally { if (!next.signal.aborted) setBusy(false); }
  }
  function invalidate() { controller.current?.abort(); setBusy(false); setResult(null); setError(""); }
  return <div className="max-w-2xl space-y-5">
    <form onSubmit={submit} onChange={invalidate} className={`${panelClass} space-y-5`}>
      <label className="block space-y-2 text-sm">Matches played<input className={fieldClass} name="matches" type="number" min="0" max="1000000" step="1" required defaultValue="100" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm">Current win rate (%)<input className={fieldClass} name="current" type="number" min="0" max="100" step="any" required defaultValue="50" /></label><label className="space-y-2 text-sm">Target win rate (%)<input className={fieldClass} name="target" type="number" min="0.000001" max="100" step="any" required defaultValue="60" /></label></div>
      <button type="submit" disabled={busy} className={actionClass}>{busy ? "Calculating…" : "Calculate consecutive wins"}</button>
    </form>
    <div aria-live="polite">{error && <p role="alert" className={panelClass}>{error}</p>}{result && <div className={`${panelClass} space-y-3`}>
      <h2 className="text-xl font-medium">{result.reason === "unreachable" ? "100% cannot be reached with existing losses" : result.reason === "already-met" ? "Your target is already met" : `${result.wins?.toLocaleString()} consecutive wins needed`}</h2>
      {result.wins !== null && <p>{result.total.toLocaleString()} total matches · approximately {result.achieved.toFixed(4)}% win rate.</p>}
      <p className="text-sm text-text-secondary">{result.source === "provider" ? "Rone API result, checked against the local calculation." : "Calculated locally."} Assumes no further losses. A rounded current percentage makes this an estimate of your actual record.</p>
    </div>}</div>
  </div>;
}
