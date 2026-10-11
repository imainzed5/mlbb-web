import { cn } from "@/lib/utils";

export function winRateTone(winRate: number) {
  if (winRate >= 52) return "text-positive";
  if (winRate < 49) return "text-negative";
  return "text-text-secondary";
}

/** Win rate with a small bar scaled from 44% to 60%. */
export function WinRateValue({ value, showBar = true, className }: { value: number; showBar?: boolean; className?: string }) {
  const width = Math.min(100, Math.max(0, ((value - 44) / 16) * 100));
  const tone = winRateTone(value);

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("num", tone)}>{value.toFixed(1)}%</span>
      {showBar ? (
        <span className="relative hidden h-1 w-12 overflow-hidden rounded-full bg-border-strong sm:block" aria-hidden>
          <span className={cn("absolute inset-y-0 left-0 rounded-full bg-current", tone)} style={{ width: `${width}%` }} />
        </span>
      ) : null}
    </span>
  );
}

export function DeltaValue({ value, suffix = "", className }: { value: number | null; suffix?: string; className?: string }) {
  if (value === null) return <span className={cn("num text-text-muted", className)}>–</span>;

  const tone = value > 0 ? "text-positive" : value < 0 ? "text-negative" : "text-negative-soft";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "•";

  return (
    <span className={cn("num text-[12px] whitespace-nowrap", tone, className)}>
      {arrow} {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}
