"use client";

import { useDeferredValue, useEffect, useState } from "react";

import type {
  HeroBrowserPayload,
  HeroBrowserSort,
  HeroRole,
} from "@/lib/heroes/types";
import { StateMessage } from "@/components/ui/StateMessage";

import { HeroFilters } from "./HeroFilters";
import { HeroGrid } from "./HeroGrid";
import { HeroList } from "./HeroList";
import { HeroSummaryRow } from "./HeroSummaryRow";

type RoleFilterValue = "All" | HeroRole;
type HeroViewMode = "grid" | "list";

type HeroesPageClientProps = {
  initialData: HeroBrowserPayload;
};

function sortHeroes(heroes: HeroBrowserPayload["heroes"], sort: HeroBrowserSort) {
  return [...heroes].sort((heroA, heroB) => {
    switch (sort) {
      case "name":
        return heroA.name.localeCompare(heroB.name);
      case "pick-rate":
        if (heroA.pickRate !== heroB.pickRate) {
          return heroB.pickRate - heroA.pickRate;
        }
        return heroA.name.localeCompare(heroB.name);
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

export function HeroesPageClient({ initialData }: HeroesPageClientProps) {
  const [query, setQuery] = useState("");
  const [activeRole, setActiveRole] = useState<RoleFilterValue>("All");
  const [activeSort, setActiveSort] = useState<HeroBrowserSort>("win-rate");
  const [activeView, setActiveView] = useState<HeroViewMode>("grid");
  const [hasResolvedDefaultView, setHasResolvedDefaultView] = useState(false);

  useEffect(() => {
    if (hasResolvedDefaultView) {
      return;
    }

    setActiveView(
      window.matchMedia("(max-width: 639px)").matches ? "list" : "grid"
    );
    setHasResolvedDefaultView(true);
  }, [hasResolvedDefaultView]);

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredHeroes = initialData.heroes.filter((hero) => {
    const matchesRole =
      activeRole === "All" || hero.roles.some((role) => role === activeRole);
    const matchesQuery =
      deferredQuery.length === 0 ||
      hero.name.toLowerCase().includes(deferredQuery) ||
      hero.slug.includes(deferredQuery.replace(/\s+/g, "-"));

    return matchesRole && matchesQuery;
  });

  const visibleHeroes = sortHeroes(filteredHeroes, activeSort);

  return (
    <div className="space-y-5 sm:space-y-6">
      <HeroSummaryRow summary={initialData.summary} />
      <HeroFilters
        query={query}
        activeRole={activeRole}
        activeSort={activeSort}
        activeView={activeView}
        onQueryChange={setQuery}
        onRoleChange={setActiveRole}
        onSortChange={setActiveSort}
        onViewChange={(view) => {
          setActiveView(view);
          setHasResolvedDefaultView(true);
        }}
      />
      {visibleHeroes.length > 0 ? (
        activeView === "grid" ? (
          <HeroGrid heroes={visibleHeroes} source="heroes" />
        ) : (
          <HeroList heroes={visibleHeroes} source="heroes" />
        )
      ) : (
        <StateMessage
          title="No heroes match the current filters"
          description="Try clearing the current search, switching the role filter back to All, or choosing a different sort to browse the full roster again."
          tone="muted"
        />
      )}
    </div>
  );
}
