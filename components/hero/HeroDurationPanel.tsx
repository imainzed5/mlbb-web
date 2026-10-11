"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { actionClass, fieldClass, panelClass } from "@/components/explore/ExploreShell";
import { HERO_DETAIL_RANK_OPTIONS, normalizeHeroDetailRank } from "@/lib/hero/constants";
import type { DurationBucket } from "@/lib/academy/duration";

type Payload = { lanes: string[]; lane: string | null; data: { overall: number | null; buckets: DurationBucket[] } | null };
export function HeroDurationPanel({ heroId }: { heroId: number }) {
  const query = useSearchParams();
  const lane = query.get("lane") ?? "";
  const rank = normalizeHeroDetailRank(query.get("rank"));
  const [attempt, retry] = useState(0);
  const key = `${heroId}:${lane}:${rank}:${attempt}`;
  const [result, setResult] = useState<{ key: string; payload?: Payload; error?: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ rank }); if (lane) params.set("lane", lane);
    fetch(`/api/academy/heroes/${heroId}/duration?${params}`, { signal: controller.signal }).then(async response => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Statistics unavailable.");
      if (!controller.signal.aborted) setResult({ key, payload });
    }).catch(error => { if (!controller.signal.aborted) setResult({ key, error: error instanceof Error ? error.message : "Statistics unavailable." }); });
    return () => controller.abort();
  }, [heroId, lane, rank, key]);
  const current = result?.key === key ? result : null;
  const payload = current?.payload;
  function update(name: string, value: string) {
    const url = new URL(window.location.href); url.searchParams.set(name, value);
    window.history.replaceState(null, "", url);
  }
  return <section className={`${panelClass} space-y-5`} aria-labelledby="duration-title">
    <header><h2 id="duration-title" className="text-lg font-medium">Win rate by match duration</h2><p className="mt-2 text-sm leading-6 text-text-secondary">Observed results grouped by match length, separate from daily trends. These are not predictions of power at a precise minute. Sample sizes and interval inclusivity are not supplied.</p></header>
    <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm">Lane<select className={fieldClass} disabled={!payload?.lanes.length} value={payload?.lane ?? lane} onChange={event => update("lane", event.target.value)}>{!payload && <option value={lane}>{lane || "Loading lanes…"}</option>}{payload?.lanes.map(value => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select></label><label className="space-y-2 text-sm">Rank<select className={fieldClass} value={rank} onChange={event => update("rank", event.target.value)}>{HERO_DETAIL_RANK_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
    <div aria-live="polite">{!current && <p>Loading duration statistics…</p>}{current?.error && <><p>{current.error}</p><button className={actionClass} type="button" onClick={() => retry(value => value + 1)}>Retry</button></>}{payload && !payload.data && <p>No statistics are published for this lane and rank.</p>}</div>
    {payload?.data && <>
      <p className="text-sm">Overall lane win rate: {payload.data.overall === null ? "Unavailable" : `${payload.data.overall.toFixed(1)}%`}</p>
      {payload.data.buckets.length > 0 ? <><div className="h-64 min-w-0" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={payload.data.buckets}><CartesianGrid stroke="var(--border-subtle)" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10 }} /><YAxis domain={[0,100]} tick={{ fontSize: 11 }} unit="%" /><Tooltip /><Bar dataKey="winRate" name="Win rate (%)" fill="var(--accent-primary)" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Win rates grouped by match duration</caption><thead><tr><th className="p-2">Duration</th><th className="p-2">Win rate</th></tr></thead><tbody>{payload.data.buckets.map(bucket => <tr key={bucket.label} className="border-t border-border-subtle"><th scope="row" className="p-2 font-normal">{bucket.label}</th><td className="p-2">{bucket.winRate === null ? "Unavailable" : `${bucket.winRate.toFixed(1)}%`}</td></tr>)}</tbody></table></div></> : <p>No duration buckets are published.</p>}
    </>}
  </section>;
}
