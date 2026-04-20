import Link from "next/link";

import type { HeroBrowserItem } from "@/lib/heroes/types";

import { HeroAvatarImage } from "./HeroAvatarImage";
import { RoleBadge } from "./RoleBadge";
import { TierBadge } from "./TierBadge";

type HeroListProps = {
  heroes: HeroBrowserItem[];
  source?: "heroes" | "rank";
};

function getHeroInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function HeroList({ heroes, source = "heroes" }: HeroListProps) {
  return (
    <div className="space-y-2.5 sm:space-y-3">
      {heroes.map((hero, index) => (
        <Link
          key={hero.heroId}
          href={`/heroes/${hero.slug}?from=${source}`}
          className="group grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 rounded-xl bg-card-surface px-3 py-2.5 transition-colors hover:border-accent-primary sm:px-4 sm:py-3"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-page-background text-[11px] font-medium text-text-secondary">
            {index + 1}
          </div>

          <div className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-card-surface-strong sm:size-12">
            <div className="absolute inset-0 flex items-center justify-center text-[12px] font-medium tracking-[0.08em] text-text-secondary">
              {getHeroInitials(hero.name)}
            </div>
            <HeroAvatarImage
              primarySrc={hero.image}
              fallbackSrc={hero.smallmap}
              alt={hero.name}
              sizes="48px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate text-[14px] font-medium text-text-primary group-hover:text-accent-text sm:text-[15px]">
                {hero.name}
              </div>
              <TierBadge tier={hero.tier} />
              <RoleBadge role={hero.primaryRole} />
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:gap-x-4 sm:text-[11px]">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-text-muted">WR</span>
                <span className="font-medium text-success-soft">{hero.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-text-muted">PR</span>
                <span className="font-medium text-accent-text">{hero.pickRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-text-muted">BR</span>
                <span className="font-medium text-warning-soft">{hero.banRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
