import Link from "next/link";

import { HeroAvatarImage } from "@/components/heroes/HeroAvatarImage";
import { DeltaValue } from "@/components/heroes/StatCells";
import { TierBadge } from "@/components/heroes/TierBadge";
import type { HeroMatchupEntry, HeroReference } from "@/lib/hero/types";

type HeroMatchupListProps = {
  id?: string;
  title: string;
  hint: string;
  emptyText: string;
  items: HeroMatchupEntry[];
  query?: string;
};

export function HeroMatchupList({ id, title, hint, emptyText, items, query = "" }: HeroMatchupListProps) {
  return (
    <section id={id} className="scroll-mt-28 rounded-lg border border-border-subtle bg-card-surface p-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        <span className="text-[11.5px] text-text-muted">{hint}</span>
      </div>

      {items.length > 0 ? (
        <ul>
          {items.slice(0, 6).map((item) => (
            <li key={item.heroId} className="border-b border-border-subtle last:border-b-0">
              <Link href={`/heroes/${item.slug}${query}`} className="group flex items-center gap-2.5 py-1.5">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                  <HeroAvatarImage primarySrc={item.image} alt="" sizes="32px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium group-hover:text-accent-text">{item.name}</span>
                  <span className="block text-[11px] text-text-muted">{item.primaryRole}</span>
                </span>
                <TierBadge tier={item.tier} />
                <span className="num w-14 text-right text-[12px] text-text-secondary">{item.heroWinRate.toFixed(1)}%</span>
                <DeltaValue value={item.deltaWinRate} className="w-12 text-right" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 text-[12.5px] text-text-secondary">{emptyText}</p>
      )}
    </section>
  );
}

export function HeroChipList({ id, title, description, heroes, query = "" }: { id?: string; title: string; description: string; heroes: HeroReference[]; query?: string }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-lg border border-border-subtle bg-card-surface p-4">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      <p className="mt-1 text-[12px] leading-5 text-text-secondary">{description}</p>
      {heroes.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {heroes.map((hero) => (
            <Link
              key={hero.heroId}
              href={`/heroes/${hero.slug}${query}`}
              className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-page-background py-0.5 pr-2 pl-0.5 text-[12px] text-text-secondary hover:border-accent-primary hover:text-accent-text"
            >
              <span className="relative size-5 overflow-hidden rounded-[4px] bg-surface-raised">
                <HeroAvatarImage primarySrc={hero.image} alt="" sizes="20px" />
              </span>
              {hero.name}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
