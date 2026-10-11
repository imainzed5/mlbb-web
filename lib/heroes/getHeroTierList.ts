import { cache } from "react";

import type { HeroDetailRank, HeroTrendWindow } from "@/lib/hero/types";

import { getHeroBrowserData } from "./getHeroBrowserData";
import type { HeroBrowserPayload, HeroTierListItem } from "./types";

export type HeroTierListPayload = Omit<HeroBrowserPayload, "heroes"> & {
  heroes: HeroTierListItem[];
  rank: HeroDetailRank;
  days: HeroTrendWindow;
  /** Window the win-rate delta is measured against, or null when no comparison is available. */
  baselineDays: HeroTrendWindow | null;
};

/**
 * Tier list rows for the selected rank and window, plus each hero's win-rate
 * change versus the 30-day baseline (a cheap stand-in for "trending").
 */
export const getHeroTierList = cache(async (
  rank: HeroDetailRank = "all",
  days: HeroTrendWindow = 7
): Promise<HeroTierListPayload> => {
  const baselineDays: HeroTrendWindow | null = days < 30 ? 30 : null;
  const [current, baseline] = await Promise.all([
    getHeroBrowserData(rank, days),
    baselineDays ? getHeroBrowserData(rank, baselineDays).catch(() => null) : Promise.resolve(null),
  ]);
  const usableBaseline = baseline && baseline.source !== "snapshot" && current.source !== "snapshot" ? baseline : null;
  const baselineById = new Map(usableBaseline?.heroes.map((hero) => [hero.heroId, hero.winRate]) ?? []);

  return {
    ...current,
    rank,
    days,
    baselineDays: usableBaseline ? baselineDays : null,
    heroes: current.heroes.map((hero) => {
      const previous = baselineById.get(hero.heroId);

      return {
        ...hero,
        winRateDelta:
          previous && hero.winRate ? Number((hero.winRate - previous).toFixed(1)) : null,
      };
    }),
  };
});
