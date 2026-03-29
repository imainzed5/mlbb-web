import Image from "next/image";
import Link from "next/link";

import type { HeroMatchupEntry } from "@/lib/hero/types";

import { RoleBadge } from "@/components/heroes/RoleBadge";
import { TierBadge } from "@/components/heroes/TierBadge";

type HeroMatchupListProps = {
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  items: HeroMatchupEntry[];
  title: string;
};

function getHeroInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function HeroMatchupList({
  description,
  emptyDescription,
  emptyTitle,
  items,
  title,
}: HeroMatchupListProps) {
  return (
    <section
      className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      <div>
        <h2 className="text-[18px] font-medium text-text-primary">{title}</h2>
        <p className="mt-1 text-[12px] leading-6 text-text-secondary">{description}</p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.slice(0, 6).map((item, index) => (
            <Link
              key={item.heroId}
              href={`/heroes/${item.slug}`}
              className="group grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 rounded-xl bg-page-background/70 px-3 py-2.5 transition-colors hover:border-accent-primary sm:px-3.5 sm:py-3"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card-surface text-[11px] font-medium text-text-secondary">
                {index + 1}
              </div>

              <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-card-surface-strong sm:size-12">
                <div className="absolute inset-0 flex items-center justify-center text-[12px] font-medium tracking-[0.08em] text-text-secondary">
                  {getHeroInitials(item.name)}
                </div>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-[13px] font-medium text-text-primary group-hover:text-accent-text sm:text-[14px]">
                    {item.name}
                  </div>
                  <TierBadge tier={item.tier} />
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:gap-x-4 sm:text-[11px]">
                  <RoleBadge role={item.primaryRole} />
                  <span className="whitespace-nowrap text-text-secondary">
                    WR {item.heroWinRate.toFixed(1)}%
                  </span>
                  <span className="whitespace-nowrap text-text-muted">
                    PR {item.appearanceRate.toFixed(1)}%
                  </span>
                  <span className="whitespace-nowrap font-medium text-success-soft">
                    swing +{item.deltaWinRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="sr-only">
                <div className="text-[11px] text-text-muted">win swing</div>
                <div className="text-[13px] font-medium text-success-soft">
                  +{item.deltaWinRate.toFixed(1)}%
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl bg-page-background/70 p-4"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="text-[13px] font-medium text-text-primary">{emptyTitle}</div>
          <p className="mt-1 text-[12px] leading-6 text-text-secondary">{emptyDescription}</p>
        </div>
      )}
    </section>
  );
}