"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  HERO_DETAIL_DEFAULT_RANK,
  HERO_DETAIL_DEFAULT_TREND_WINDOW,
  HERO_DETAIL_RANK_OPTIONS,
  HERO_DETAIL_TREND_WINDOW_OPTIONS,
  normalizeHeroDetailRank,
  normalizeHeroTrendWindow,
} from "@/lib/hero/constants";
import { cn } from "@/lib/utils";

type SegmentProps<T extends string | number> = {
  label: string;
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
};

function Segment<T extends string | number>({ label, options, value, onChange }: SegmentProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-md border border-border-subtle bg-card-surface p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-sm px-2.5 py-1 text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/70",
              option.value === value ? "bg-surface-raised text-text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const rankOptions = HERO_DETAIL_RANK_OPTIONS.map((option) => ({
  ...option,
  label: option.value === "all" ? "All" : option.label,
}));

/** Rank + window filters stored in the URL (?rank=&days=), shared with hero pages. */
export function GlobalFilters({ trailing }: { trailing?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const rank = normalizeHeroDetailRank(searchParams.get("rank"));
  const days = normalizeHeroTrendWindow(searchParams.get("days"));

  function update(key: "rank" | "days", value: string, fallback: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 transition-opacity", pending && "opacity-60")}>
      <Segment label="Rank" options={rankOptions} value={rank} onChange={(value) => update("rank", value, HERO_DETAIL_DEFAULT_RANK)} />
      <Segment
        label="Window"
        options={HERO_DETAIL_TREND_WINDOW_OPTIONS}
        value={days}
        onChange={(value) => update("days", String(value), String(HERO_DETAIL_DEFAULT_TREND_WINDOW))}
      />
      {trailing ? <div className="ml-auto text-[12px] text-text-muted">{trailing}</div> : null}
    </div>
  );
}
