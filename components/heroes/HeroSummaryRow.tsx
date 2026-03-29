import { ArrowUpRight, Crown } from "lucide-react";
import Link from "next/link";

import type { HeroBrowserSummary } from "@/lib/heroes/types";

type HeroSummaryRowProps = {
  summary: HeroBrowserSummary;
};

export function HeroSummaryRow({ summary }: HeroSummaryRowProps) {
  const metrics = [
    { value: String(summary.totalHeroes), label: "Total heroes" },
    { value: String(summary.fightersCount), label: "Fighters" },
    { value: String(summary.magesCount), label: "Mages" },
    {
      value: summary.highestWinRateHero?.name ?? "N/A",
      label: summary.highestWinRateHero
        ? `${summary.highestWinRateHero.winRate.toFixed(1)}% highest win rate`
        : "Highest win rate hero",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl bg-card-surface px-3.5 py-3 sm:px-4 sm:py-3.5"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="truncate text-[18px] font-medium text-text-primary sm:text-[20px]">
            {metric.value}
          </div>
          <div className="mt-1.5 text-[11px] leading-5 text-text-muted">{metric.label}</div>
        </div>
      ))}

      <Link
        href="/heroes/rank"
        className="rounded-xl bg-card-surface px-3.5 py-3 transition-colors hover:border-accent-primary sm:px-4 sm:py-3.5"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent-surface text-accent-text">
            <Crown className="size-4" strokeWidth={2} />
          </div>
          <ArrowUpRight className="size-4 text-text-muted" strokeWidth={2} />
        </div>
        <div className="mt-3 text-[16px] font-medium text-text-primary">Rank board</div>
        <div className="mt-1.5 text-[11px] leading-5 text-text-muted">
          Open the full tier-first ranking table.
        </div>
      </Link>
    </div>
  );
}
