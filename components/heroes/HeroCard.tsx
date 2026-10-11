import Link from "next/link";

import type { HeroBrowserItem } from "@/lib/heroes/types";

import { HeroAvatarImage } from "./HeroAvatarImage";
import { TierBadge } from "./TierBadge";

type HeroCardProps = {
  hero: HeroBrowserItem;
};

function getHeroInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getWinRateClassName(winRate: number) {
  if (winRate >= 52) {
    return "text-success-soft";
  }

  if (winRate >= 49) {
    return "text-warning-soft";
  }

  return "text-text-muted";
}

export function HeroCard({ hero }: HeroCardProps) {
  return (
    <Link href={`/heroes/${hero.slug}`} className="group block">
      <article
        className="overflow-hidden rounded-lg bg-card-surface transition-colors border border-border-subtle group-hover:border-accent-primary"
      >
        <div className="relative aspect-square bg-card-surface-strong">
          <div className="absolute left-1.5 top-1.5 z-10">
            <TierBadge tier={hero.tier} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex size-18 items-center justify-center rounded-full text-[17px] font-medium tracking-[0.08em] text-text-secondary sm:size-20 sm:text-[19px]"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              {getHeroInitials(hero.name)}
            </div>
          </div>

          <HeroAvatarImage
            primarySrc={hero.image}
            fallbackSrc={hero.smallmap}
            alt={hero.name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1440px) 20vw, 200px"
            className="object-cover"
          />
        </div>

        <div className="space-y-1 px-2 py-1.5">
          <div className="truncate text-[12.5px] font-semibold text-text-primary">
            {hero.name}
          </div>
          <div className="flex items-center justify-between gap-2.5">
            <span className="truncate text-[11px] text-text-secondary">{hero.primaryRole}</span>
            <span className={`num text-[11.5px] ${getWinRateClassName(hero.winRate)}`}>
              {hero.winRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
