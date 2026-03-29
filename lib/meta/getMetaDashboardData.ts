import type { HeroDetailRank } from "@/lib/hero/types";
import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";

import { deriveMetaDashboardView } from "./dashboard";
import type { MetaDashboardData, MetaLaneFilter, MetaRoleFilter } from "./types";

type GetMetaDashboardDataOptions = {
  lane?: MetaLaneFilter;
  rank?: HeroDetailRank;
  role?: MetaRoleFilter;
};

export async function getMetaDashboardData({
  lane = "all",
  rank = "all",
  role = "all",
}: GetMetaDashboardDataOptions = {}): Promise<MetaDashboardData> {
  const heroBrowserData = await getHeroBrowserData(rank);
  const heroes = heroBrowserData.heroes;

  return {
    filters: {
      lane,
      rank,
      role,
    },
    generatedAt: heroBrowserData.generatedAt,
    heroes,
    initialView: deriveMetaDashboardView(heroes, lane, role),
    stale: heroBrowserData.stale,
  };
}