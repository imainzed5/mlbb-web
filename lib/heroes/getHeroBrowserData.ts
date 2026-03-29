import { cache } from "react";

import type { HeroDetailRank } from "@/lib/hero/types";
import { REVALIDATE_WINDOWS } from "@/lib/mlbb/cache";
import { HERO_BROWSER_PAGE_SIZE } from "@/lib/mlbb/constants";
import { fetchMlbbCollection } from "@/lib/mlbb/client";
import type {
  RawHeroListRecord,
  RawHeroPositionsRecord,
  RawHeroRankRecord,
} from "@/lib/mlbb/types";

import { buildHeroBrowserSummary, mergeHeroBrowserRecords } from "./normalizers";
import type { HeroBrowserPayload } from "./types";

export const getHeroBrowserData = cache(async (
  rank: HeroDetailRank = "all"
): Promise<HeroBrowserPayload> => {
  const [heroListResponse, positionsResponse, rankResponse] = await Promise.all([
    fetchMlbbCollection<RawHeroListRecord>(
      `/heroes?size=${HERO_BROWSER_PAGE_SIZE}&index=1&lang=en`,
      { revalidate: REVALIDATE_WINDOWS.heroes }
    ),
    fetchMlbbCollection<RawHeroPositionsRecord>(
      `/heroes/positions?size=${HERO_BROWSER_PAGE_SIZE}&index=1&lang=en`,
      { revalidate: REVALIDATE_WINDOWS.heroes }
    ),
    fetchMlbbCollection<RawHeroRankRecord>(
      `/heroes/rank?days=7&rank=${rank}&sort_field=win_rate&sort_order=desc&size=${HERO_BROWSER_PAGE_SIZE}&index=1&lang=en`,
      { revalidate: REVALIDATE_WINDOWS.heroRank }
    ),
  ]);

  const heroes = mergeHeroBrowserRecords(
    heroListResponse.data.records,
    positionsResponse.data.records,
    rankResponse.data.records
  );

  return {
    heroes,
    summary: buildHeroBrowserSummary(heroes),
    generatedAt: new Date().toISOString(),
    stale: false,
  };
});