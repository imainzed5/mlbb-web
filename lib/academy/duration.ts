import { list, number, object, percent } from "@/lib/mlbb/records";

export type DurationBucket = { min: number; max: number | null; label: string; winRate: number | null };
export function normalizeDuration(records: unknown[], heroId: number) {
  const data = records.map(record => object(object(record).data)).find(data => number(data.heroid) === heroId);
  if (!data) return null;
  const buckets: DurationBucket[] = [];
  for (const raw of list(data.time_win_rate)) {
    const bucket = object(raw); const min = number(bucket.time_min); const max = number(bucket.time_max);
    if (min === null || min < 0 || (max !== null && max <= min)) continue;
    buckets.push({ min, max, label: max === null ? `${min}+ min` : `${min}–${max} min`, winRate: percent(bucket.win_rate) });
  }
  return { overall: percent(data.total_win_rate), buckets: buckets.sort((a,b) => a.min - b.min) };
}
