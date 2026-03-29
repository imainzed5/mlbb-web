import Image from "next/image";
import Link from "next/link";

import type { HeroBrowserItem } from "@/lib/heroes/types";

import { RoleBadge } from "./RoleBadge";
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
        className="overflow-hidden rounded-2xl bg-card-surface transition-colors group-hover:border-accent-primary"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      >
        <div className="relative aspect-[5/4] bg-card-surface-strong sm:aspect-[4/3] lg:aspect-[5/4]">
          <div className="absolute left-2.5 top-2.5 z-10 sm:left-3 sm:top-3">
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

          {hero.image ? (
            <Image
              src={hero.image}
              alt={hero.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1440px) 20vw, 200px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="space-y-2 p-2.5 sm:space-y-2 sm:p-3">
          <div className="truncate text-[13px] font-medium text-[#d0d7e3] sm:text-[14px]">
            {hero.name}
          </div>
          <div className="flex items-center justify-between gap-2.5">
            <RoleBadge role={hero.primaryRole} />
            <span className={`text-[11px] font-medium sm:text-[12px] ${getWinRateClassName(hero.winRate)}`}>
              {hero.winRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}