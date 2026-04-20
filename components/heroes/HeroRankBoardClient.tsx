"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { HeroAvatarImage } from "@/components/heroes/HeroAvatarImage";
import { RoleBadge } from "@/components/heroes/RoleBadge";
import { TierBadge } from "@/components/heroes/TierBadge";
import { StateMessage } from "@/components/ui/StateMessage";
import { HERO_ROLES } from "@/lib/heroes/constants";
import type { HeroBrowserItem, HeroRole, HeroTier } from "@/lib/heroes/types";

type HeroRankBoardClientProps = {
  heroes: HeroBrowserItem[];
  stale?: boolean;
};

type RoleFilterValue = "All" | HeroRole;
type TierFilterValue = "All" | HeroTier;
type RankSortValue = "ban-rate" | "name" | "pick-rate" | "tier" | "win-rate";

const tierFilters: TierFilterValue[] = ["All", "S", "A", "B", "C"];
const tierOrder: HeroTier[] = ["S", "A", "B", "C"];

const sortOptions: Array<{ label: string; value: RankSortValue }> = [
  { label: "Tier first", value: "tier" },
  { label: "Win rate", value: "win-rate" },
  { label: "Pick rate", value: "pick-rate" },
  { label: "Ban rate", value: "ban-rate" },
  { label: "Name A-Z", value: "name" },
];

function sortHeroes(heroes: HeroBrowserItem[], sort: RankSortValue) {
  return [...heroes].sort((heroA, heroB) => {
    switch (sort) {
      case "name":
        return heroA.name.localeCompare(heroB.name);
      case "pick-rate":
        if (heroA.pickRate !== heroB.pickRate) {
          return heroB.pickRate - heroA.pickRate;
        }
        return heroB.winRate - heroA.winRate;
      case "ban-rate":
        if (heroA.banRate !== heroB.banRate) {
          return heroB.banRate - heroA.banRate;
        }
        return heroB.winRate - heroA.winRate;
      case "tier":
        if (heroA.tierOrder !== heroB.tierOrder) {
          return heroA.tierOrder - heroB.tierOrder;
        }
        if (heroA.winRate !== heroB.winRate) {
          return heroB.winRate - heroA.winRate;
        }
        return heroA.name.localeCompare(heroB.name);
      case "win-rate":
      default:
        if (heroA.winRate !== heroB.winRate) {
          return heroB.winRate - heroA.winRate;
        }
        if (heroA.pickRate !== heroB.pickRate) {
          return heroB.pickRate - heroA.pickRate;
        }
        return heroA.name.localeCompare(heroB.name);
    }
  });
}

function getHeroInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function HeroRankBoardClient({ heroes, stale = false }: HeroRankBoardClientProps) {
  const [query, setQuery] = useState("");
  const [activeRole, setActiveRole] = useState<RoleFilterValue>("All");
  const [activeTier, setActiveTier] = useState<TierFilterValue>("All");
  const [activeSort, setActiveSort] = useState<RankSortValue>("tier");

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredHeroes = heroes.filter((hero) => {
    const matchesQuery =
      deferredQuery.length === 0 ||
      hero.name.toLowerCase().includes(deferredQuery) ||
      hero.slug.includes(deferredQuery.replace(/\s+/g, "-"));
    const matchesRole =
      activeRole === "All" || hero.roles.some((role) => role === activeRole);
    const matchesTier = activeTier === "All" || hero.tier === activeTier;

    return matchesQuery && matchesRole && matchesTier;
  });

  const visibleHeroes = sortHeroes(filteredHeroes, activeSort);
  const topWinHero = visibleHeroes[0] ?? null;
  const topPickHero = sortHeroes(filteredHeroes, "pick-rate")[0] ?? null;
  const topBanHero = sortHeroes(filteredHeroes, "ban-rate")[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <article
          className="rounded-2xl bg-card-surface p-4"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
            Highest win rate
          </div>
          <div className="mt-3 text-[18px] font-medium text-text-primary">
            {topWinHero ? topWinHero.name : "No hero"}
          </div>
          <div className="mt-1 text-[12px] text-success-soft">
            {topWinHero ? `${topWinHero.winRate.toFixed(1)}% WR` : "Waiting for data"}
          </div>
        </article>

        <article
          className="rounded-2xl bg-card-surface p-4"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
            Highest pick rate
          </div>
          <div className="mt-3 text-[18px] font-medium text-text-primary">
            {topPickHero ? topPickHero.name : "No hero"}
          </div>
          <div className="mt-1 text-[12px] text-accent-text">
            {topPickHero ? `${topPickHero.pickRate.toFixed(1)}% PR` : "Waiting for data"}
          </div>
        </article>

        <article
          className="col-span-2 rounded-2xl bg-card-surface p-4 xl:col-span-1"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
            Highest ban rate
          </div>
          <div className="mt-3 text-[18px] font-medium text-text-primary">
            {topBanHero ? topBanHero.name : "No hero"}
          </div>
          <div className="mt-1 text-[12px] text-warning-soft">
            {topBanHero ? `${topBanHero.banRate.toFixed(1)}% BR` : "Waiting for data"}
          </div>
        </article>
      </section>

      <section
        className="space-y-5 rounded-2xl bg-card-surface p-4 sm:p-5"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <label className="block lg:max-w-none lg:flex-1">
            <span className="mb-2 block text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Search heroes
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by hero name"
              className="w-full rounded-xl bg-page-background px-3 py-2.5 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Sort board
            </span>
            <select
              value={activeSort}
              onChange={(event) => setActiveSort(event.target.value as RankSortValue)}
              className="w-full rounded-xl bg-page-background px-3 py-2.5 text-[13px] text-text-primary outline-none transition-colors focus:border-accent-primary"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-2 text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Role filter
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveRole("All")}
                className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
                  style={{
                    background: activeRole === "All" ? "#2d2414" : "var(--card-surface)",
                    border: activeRole === "All" ? "1px solid #8f6a10" : "0.5px solid var(--border-subtle)",
                    color: activeRole === "All" ? "#fcd34d" : "var(--text-secondary)",
                    WebkitTextFillColor: activeRole === "All" ? "#fcd34d" : undefined,
                  }}
              >
                All roles
              </button>
              {HERO_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
                  style={{
                    background:
                      activeRole === role ? "#2d2414" : "var(--card-surface)",
                    border: activeRole === role ? "1px solid #8f6a10" : "0.5px solid var(--border-subtle)",
                    color:
                      activeRole === role ? "#fcd34d" : "var(--text-secondary)",
                    WebkitTextFillColor: activeRole === role ? "#fcd34d" : undefined,
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
              Tier focus
            </div>
            <div className="flex flex-wrap gap-2">
              {tierFilters.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setActiveTier(tier)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors"
                  style={{
                    background:
                      activeTier === tier ? "#2d2414" : "var(--card-surface)",
                    border: activeTier === tier ? "1px solid #8f6a10" : "0.5px solid var(--border-subtle)",
                    color:
                      activeTier === tier ? "#fcd34d" : "var(--text-secondary)",
                    WebkitTextFillColor: activeTier === tier ? "#fcd34d" : undefined,
                  }}
                >
                  {tier === "All" ? "All tiers" : `Tier ${tier}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {visibleHeroes.length > 0 ? (
        <div className="space-y-4">
          {tierOrder.map((tier) => {
            const tierHeroes = visibleHeroes.filter((hero) => hero.tier === tier);

            if (tierHeroes.length === 0) {
              return null;
            }

            return (
              <section
                key={tier}
                className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5"
                style={{ border: "0.5px solid var(--border-subtle)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TierBadge tier={tier} />
                    <div>
                      <h2 className="text-[18px] font-medium text-text-primary">Tier {tier}</h2>
                      <p className="text-[12px] text-text-secondary">
                        {tierHeroes.length} hero{tierHeroes.length === 1 ? "" : "es"} in the current view
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Sorted by {sortOptions.find((option) => option.value === activeSort)?.label.toLowerCase()}
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {tierHeroes.map((hero, index) => (
                    <Link
                      key={hero.heroId}
                      href={`/heroes/${hero.slug}?from=rank`}
                      className="group grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 rounded-xl bg-page-background/70 px-3 py-2.5 transition-colors hover:border-accent-primary sm:px-4 sm:py-3"
                      style={{ border: "0.5px solid var(--border-subtle)" }}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card-surface text-[11px] font-medium text-text-secondary">
                        {index + 1}
                      </div>

                      <div className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-card-surface-strong sm:size-12">
                        <div className="absolute inset-0 flex items-center justify-center text-[14px] font-medium tracking-[0.08em] text-text-secondary">
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

                      <div className="min-w-0 flex-1 self-stretch">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-[14px] font-medium text-text-primary group-hover:text-accent-text sm:text-[15px]">
                            {hero.name}
                          </div>
                          <RoleBadge role={hero.primaryRole} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:gap-x-4 sm:text-[11px]">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-text-muted">WR</span>
                            <span className="font-medium text-success-soft">
                              {hero.winRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-text-muted">PR</span>
                            <span className="font-medium text-accent-text">
                              {hero.pickRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-text-muted">BR</span>
                            <span className="font-medium text-warning-soft">
                              {hero.banRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        stale && heroes.length === 0 ? (
          <StateMessage
            title="Live rank data is temporarily unavailable"
            description="The upstream MLBB API is unavailable and there is no ranking snapshot cached yet. Please try again shortly."
            tone="error"
          />
        ) : (
          <StateMessage
            title="No heroes match the current board filters"
            description="Clear the search, open the tier filter back up, or switch the role filter to All to restore the full ranking board."
            tone="muted"
          />
        )
      )}

      {stale && heroes.length > 0 ? (
        <StateMessage
          title="Rank board is using stale data"
          description="One or more upstream endpoints were unavailable during aggregation, so some rank metrics may be temporarily out of date."
          tone="muted"
        />
      ) : null}
    </div>
  );
}
