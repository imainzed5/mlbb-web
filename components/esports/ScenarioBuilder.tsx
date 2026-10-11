"use client";

import { useEffect, useRef, useState } from "react";
import { actionClass, fieldClass, panelClass } from "@/components/explore/ExploreShell";
import { importScenario, matchKey, validateScenario, type ScenarioInput, type Simulation } from "@/lib/esports/scenarios";
import type { readStandings } from "@/lib/esports/standings";

type Kind = "ph" | "id" | "custom";
const scores = [{ value: "unplayed", label: "Not played / clear result" }, ...["2-0", "2-1", "1-2", "0-2"].map(value => ({ value, label: value.replace("-", "–") }))];
export function ScenarioBuilder({ kind, initial, published = [] }: { kind: Kind; initial: Simulation | null; published?: ReturnType<typeof readStandings> }) {
  const [baseline, setBaseline] = useState(initial);
  const [result, setResult] = useState(initial);
  const [edits, setEdits] = useState<Record<string,string>>({});
  const [names, setNames] = useState("Alpha\nBravo\nCharlie\nDelta");
  const [generatedNames, setGeneratedNames] = useState("");
  const [eliminated, setEliminated] = useState(initial ? initial.teams - initial.playoffSpots : kind === "ph" ? 2 : kind === "id" ? 3 : 1);
  const [model, setModel] = useState<"form" | "even">("form");
  const [samples, setSamples] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const custom = kind === "custom";
  const structureChanged = custom && generatedNames !== names;
  function invalidate() { pending.current?.abort(); setBusy(false); setResult(null); setError(""); }
  function input(generate = false): ScenarioInput {
    const results = generate ? [] : (baseline?.matches ?? []).flatMap(match => {
      const edit = edits[matchKey(match)];
      if (edit === undefined) return [];
      const parts = edit.split("-");
      return [{ week: match.week, team1: match.team1, team2: match.team2, score1: edit === "unplayed" ? null : Number(parts[0]), score2: edit === "unplayed" ? null : Number(parts[1]) }];
    });
    return validateScenario({ ...(custom ? { teams: names.split("\n").map(name => name.trim()).filter(Boolean) } : {}), eliminated, results, model, ...(samples ? { simulations: Number(samples) } : {}) }, custom, !custom && baseline ? baseline.matches : undefined);
  }
  async function run(generate = false, override?: ScenarioInput) {
    let body;
    try { body = override ?? input(generate); }
    catch (error) { setError(error instanceof Error ? error.message : "Invalid scenario."); return; }
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/esports/${kind}/simulate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Simulation unavailable.");
      if (controller.signal.aborted) return;
      if (generate || !baseline) { setBaseline(payload); setEdits({}); if (custom) setGeneratedNames(names); }
      setResult(payload);
    } catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Simulation unavailable."); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  function reset() {
    pending.current?.abort(); setBusy(false); setError(""); setEdits({}); setResult(baseline); setModel(baseline?.model ?? "form"); setSamples("");
    if (baseline) setEliminated(baseline.teams - baseline.playoffSpots);
    if (custom && generatedNames) setNames(generatedNames);
  }
  function exportJson() {
    try {
      const content = JSON.stringify({ version: 1, kind, input: input() }, null, 2);
      const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `mlbb-${kind}-scenario.json`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setError(error instanceof Error ? error.message : "Cannot export scenario."); }
  }
  async function applyImport(value: string) {
    let importController: AbortController | null = null;
    try {
      if (new TextEncoder().encode(value).length > 65536) throw new Error("Scenario is too large (maximum 64 KB).");
      const parsed = importScenario(JSON.parse(value), kind);
      if (!custom && baseline) validateScenario(parsed, false, baseline.matches);
      invalidate();
      setModel(parsed.model); setSamples(parsed.simulations ? String(parsed.simulations) : "");
      setEliminated(parsed.eliminated ?? (custom ? 1 : kind === "ph" ? 2 : 3));
      if (custom) {
        // Import computes a new schedule before installing its edits, so names and results stay aligned.
        pending.current?.abort(); const controller = new AbortController(); pending.current = controller; setBusy(true);
        importController = controller;
        const response = await fetch(`/api/esports/custom/simulate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed, results: [] }), signal: controller.signal });
        const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "Import unavailable.");
        if (controller.signal.aborted) return;
        validateScenario(parsed, true, payload.matches);
        const teamNames = parsed.teams!.join("\n"); setNames(teamNames); setGeneratedNames(teamNames); setBaseline(payload);
        const edits: Record<string,string> = {};
        for (const match of payload.matches) {
          const imported = parsed.results.find(row => matchKey(row) === matchKey(match));
          if (!imported) continue;
          const forward = imported.team1 === match.team1;
          edits[matchKey(match)] = imported.score1 === null ? "unplayed" : forward ? `${imported.score1}-${imported.score2}` : `${imported.score2}-${imported.score1}`;
        }
        setEdits(edits); setResult(null); setBusy(false);
      } else {
        const edits: Record<string,string> = {};
        for (const match of baseline?.matches ?? []) {
          const imported = parsed.results.find(row => matchKey(row) === matchKey(match));
          if (imported) edits[matchKey(match)] = imported.score1 === null ? "unplayed" : imported.team1 === match.team1 ? `${imported.score1}-${imported.score2}` : `${imported.score2}-${imported.score1}`;
        }
        setEdits(edits);
      }
    } catch (error) { if (importController?.signal.aborted) return; setBusy(false); setError(error instanceof Error ? error.message : "Invalid scenario JSON."); }
  }
  const weeks = [...new Set(baseline?.matches.map(match => match.week) ?? [])];
  const baselineStandings = custom || !published.length ? baseline?.standings : published;
  return <div className="space-y-6">
    <section className={`${panelClass} space-y-5`} aria-label="Scenario settings">
      {custom && <label className="block space-y-2 text-sm">Team names (one per line, 2–20)<textarea className={`${fieldClass} min-h-36`} maxLength={820} value={names} onChange={event => { invalidate(); setNames(event.target.value); }} /></label>}
      <div className="grid gap-4 sm:grid-cols-3"><label className="space-y-2 text-sm">Teams eliminated<input className={fieldClass} type="number" min="0" max={(baseline?.teams ?? 20)-1} step="1" value={eliminated} onChange={event => { invalidate(); setEliminated(Number(event.target.value)); }} /></label><label className="space-y-2 text-sm">Probability model<select className={fieldClass} value={model} onChange={event => { invalidate(); setModel(event.target.value as "form" | "even"); }}><option value="form">Form (current record)</option><option value="even">Even (coin flip)</option></select></label><label className="space-y-2 text-sm">Samples (optional)<input className={fieldClass} type="number" min="100" max="20000" step="1" value={samples} placeholder="Provider default" onChange={event => { invalidate(); setSamples(event.target.value); }} /></label></div>
      <p className="text-xs leading-6 text-text-secondary">Probabilities estimate remaining match outcomes using the selected model; they are not guarantees. Status is separate from probability. Unresolved source tiebreaks stay unresolved.</p>
      <div className="flex flex-wrap gap-3">{custom && <button type="button" className={actionClass} disabled={busy} onClick={() => run(true)}>Generate new schedule</button>}<button type="button" className={actionClass} disabled={busy || (custom && (!baseline || structureChanged))} onClick={() => run()}>{busy ? "Calculating…" : baseline ? "Run scenario" : "Load current results"}</button>{baseline && <button type="button" className={actionClass} onClick={reset}>Reset to {custom ? "generated schedule" : "actual results"}</button>}</div>
      {structureChanged && baseline && <p className="text-sm">Team names changed. Generate a new schedule before running this scenario.</p>}
      <div aria-live="polite">{error && <p role="alert" className="text-warning-soft">{error}</p>}{!result && baseline && !busy && <p className="text-sm text-text-secondary">Edits are pending. Run the scenario to update standings.</p>}</div>
    </section>
    {baseline && <section className="space-y-3"><h2 className="text-lg font-medium">Match results</h2><p className="text-sm text-text-secondary">Choose finished scores or clear a result. Unedited matches retain the baseline result.</p>{weeks.map(week => <details key={week} className={panelClass} open={weeks.length <= 2}><summary className="cursor-pointer font-medium">Week {week}</summary><div className="mt-4 space-y-3">{baseline.matches.filter(match => match.week === week).map(match => {
      const key = matchKey(match); const original = match.score1 === null || match.score2 === null ? "unplayed" : `${match.score1}-${match.score2}`;
      return <label key={key} className="grid items-center gap-3 border-t border-border-subtle pt-3 text-sm sm:grid-cols-[minmax(0,1fr)_240px]"><span className="min-w-0 [overflow-wrap:anywhere]">{match.team1} vs {match.team2}<span className="ml-2 text-xs text-text-secondary">{edits[key] !== undefined ? "Edited" : "Baseline"}</span></span><select className={fieldClass} value={edits[key] ?? original} disabled={structureChanged} onChange={event => { invalidate(); const value = event.target.value; setEdits(previous => { const next = { ...previous }; if (value === original) delete next[key]; else next[key] = value; return next; }); }}>{scores.map(score => <option key={score.value} value={score.value}>{score.label}</option>)}</select></label>;
    })}</div></details>)}</section>}
    {result && <section className={`${panelClass} space-y-4`}><h2 className="text-lg font-medium">Scenario standings</h2><p className="text-sm text-text-secondary">{result.playoffSpots} playoff spots · {result.played} played · {result.remaining} remaining · {result.edited} edits. Model: {result.model}, {result.samples.toLocaleString()} samples{result.samples === 0 ? " (no future matches simulated)" : ""}.</p>{!custom && <p className="text-xs leading-6 text-text-secondary">Baseline rank preserves the published standings when available. The provider simulator recalculates tiebreaks and can order equal-record teams differently even without edits. Scenario ranks are not official league decisions.</p>}<div className="overflow-x-auto"><table className="w-full min-w-[660px] text-left text-sm"><caption className="sr-only">Baseline and scenario standings comparison</caption><thead><tr>{["Team", "Baseline rank", "Scenario rank", "Points before → after", "Status", "Playoff estimate", "Tiebreak"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{result.standings.map(row => { const original = baselineStandings?.find(team => team.team.name === row.team.name); return <tr key={row.team.name} className="border-t border-border-subtle"><th scope="row" className="p-3 font-medium">{row.team.name}</th><td className="p-3">{original?.rank ?? "—"}</td><td className="p-3">{row.rank ?? "—"}</td><td className="p-3">{original?.points ?? "—"} → {row.points ?? "—"}</td><td className="p-3">{row.status}</td><td className="p-3">{row.probability.toFixed(1)}%</td><td className="p-3">{row.tiebreak?.replace(/_/g," ") || "—"}</td></tr>; })}</tbody></table></div></section>}
    <details className={panelClass}><summary className="cursor-pointer font-medium">Save or import a scenario</summary><div className="mt-4 space-y-4"><p className="text-sm text-text-secondary">Exported JSON stores teams/settings and edits locally. Nothing is saved to an account. Match sets can change with a new season.</p><button type="button" className={actionClass} disabled={!baseline || structureChanged || busy} onClick={exportJson}>Export scenario JSON</button><label className="block space-y-2 text-sm">Import JSON file<input className={fieldClass} type="file" accept="application/json,.json" disabled={busy} onChange={async event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 65536) { setError("Scenario is too large (maximum 64 KB)."); return; } await applyImport(await file.text()); event.target.value = ""; }} /></label><label className="block space-y-2 text-sm">Or paste scenario JSON<textarea className={`${fieldClass} min-h-28`} maxLength={65536} value={importText} onChange={event => setImportText(event.target.value)} /></label><button type="button" disabled={busy || !importText.trim()} className={actionClass} onClick={() => applyImport(importText)}>Import pasted scenario</button></div></details>
  </div>;
}
