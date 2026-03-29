import type { HeroDetailRank } from "@/lib/hero/types";
import type { HeroBrowserItem, HeroLane, HeroRole, HeroTier } from "@/lib/heroes/types";

export type MetaLaneFilter = "all" | HeroLane;

export type MetaRoleFilter =
  | "all"
  | "fighter"
  | "mage"
  | "assassin"
  | "tank"
  | "support"
  | "marksman";

export type MetaDashboardFilters = {
  lane: MetaLaneFilter;
  rank: HeroDetailRank;
  role: MetaRoleFilter;
};

export type MetaRoleSnapshot = {
  averageBanRate: number;
  averagePickRate: number;
  averageWinRate: number;
  count: number;
  leader: HeroBrowserItem | null;
  role: HeroRole;
};

export type MetaTierSnapshot = {
  averagePickRate: number;
  averageWinRate: number;
  count: number;
  leader: HeroBrowserItem | null;
  tier: HeroTier;
};

export type MetaComparisonKey = "contested" | "rising" | "safe";

export type MetaComparisonGroup = {
  description: string;
  heroes: HeroBrowserItem[];
  key: MetaComparisonKey;
  title: string;
};

export type MetaDashboardView = {
  comparisons: MetaComparisonGroup[];
  contestedHeroes: HeroBrowserItem[];
  filteredHeroes: HeroBrowserItem[];
  flexHeroes: HeroBrowserItem[];
  lane: MetaLaneFilter;
  role: MetaRoleFilter;
  powerBoards: {
    banRate: HeroBrowserItem[];
    pickRate: HeroBrowserItem[];
    winRate: HeroBrowserItem[];
  };
  roleSnapshots: MetaRoleSnapshot[];
  summary: {
    heroCount: number;
    laneLabel: string;
    roleLabel: string;
    topBanHero: HeroBrowserItem | null;
    topPickHero: HeroBrowserItem | null;
    topTierCount: number;
    topWinHero: HeroBrowserItem | null;
  };
  tierSnapshots: MetaTierSnapshot[];
};

export type MetaDashboardData = {
  filters: MetaDashboardFilters;
  generatedAt: string;
  heroes: HeroBrowserItem[];
  initialView: MetaDashboardView;
  stale: boolean;
};