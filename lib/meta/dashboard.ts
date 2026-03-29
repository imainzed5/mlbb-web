import { MLBB_SUPPORTED_LANES } from "@/lib/mlbb/constants";
import { HERO_ROLES } from "@/lib/heroes/constants";
import type { HeroBrowserItem, HeroLane, HeroTier } from "@/lib/heroes/types";

import type {
  MetaComparisonGroup,
  MetaDashboardView,
  MetaLaneFilter,
  MetaRoleFilter,
  MetaRoleSnapshot,
  MetaTierSnapshot,
} from "./types";

const HERO_TIERS: HeroTier[] = ["S", "A", "B", "C"];

const META_ROLE_TO_HERO_ROLE = {
  fighter: "Fighter",
  mage: "Mage",
  assassin: "Assassin",
  tank: "Tank",
  support: "Support",
  marksman: "Marksman",
} as const;

export const META_LANE_OPTIONS: Array<{ label: string; value: MetaLaneFilter }> = [
  { label: "All lanes", value: "all" },
  { label: "EXP", value: "exp" },
  { label: "Gold", value: "gold" },
  { label: "Jungle", value: "jungle" },
  { label: "Mid", value: "mid" },
  { label: "Roam", value: "roam" },
];

export const META_ROLE_OPTIONS: Array<{ label: string; value: MetaRoleFilter }> = [
  { label: "All roles", value: "all" },
  { label: "Fighter", value: "fighter" },
  { label: "Mage", value: "mage" },
  { label: "Assassin", value: "assassin" },
  { label: "Tank", value: "tank" },
  { label: "Support", value: "support" },
  { label: "Marksman", value: "marksman" },
];

function average(items: HeroBrowserItem[], selector: (hero: HeroBrowserItem) => number) {
  if (items.length === 0) {
    return 0;
  }

  const total = items.reduce((sum, item) => sum + selector(item), 0);
  return Number((total / items.length).toFixed(1));
}

function sortByMetric(
  heroes: HeroBrowserItem[],
  selector: (hero: HeroBrowserItem) => number
) {
  return [...heroes].sort((heroA, heroB) => {
    const metricDelta = selector(heroB) - selector(heroA);

    if (metricDelta !== 0) {
      return metricDelta;
    }

    if (heroA.winRate !== heroB.winRate) {
      return heroB.winRate - heroA.winRate;
    }

    return heroA.name.localeCompare(heroB.name);
  });
}

function buildComparisonGroups(heroes: HeroBrowserItem[]): MetaComparisonGroup[] {
  const rising = [...heroes]
    .sort((heroA, heroB) => {
      const scoreA = heroA.winRate * 0.6 + heroA.pickRate * 0.35 - heroA.banRate * 0.25;
      const scoreB = heroB.winRate * 0.6 + heroB.pickRate * 0.35 - heroB.banRate * 0.25;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  const contested = sortByMetric(heroes, (hero) => hero.banRate).slice(0, 6);

  const safe = [...heroes]
    .sort((heroA, heroB) => {
      const scoreA = heroA.winRate - heroA.banRate * 0.75 + heroA.pickRate * 0.15;
      const scoreB = heroB.winRate - heroB.banRate * 0.75 + heroB.pickRate * 0.15;
      return scoreB - scoreA;
    })
    .slice(0, 6);

  return [
    {
      description: "High-ban heroes that are forcing respect in draft even before lane-specific bans settle.",
      heroes: contested,
      key: "contested",
      title: "Most contested",
    },
    {
      description: "Heroes combining strong win rate and real pick traction without maxing out ban pressure yet.",
      heroes: rising,
      key: "rising",
      title: "Rising momentum",
    },
    {
      description: "Stable comfort options with strong results and lower ban exposure than the headline threats.",
      heroes: safe,
      key: "safe",
      title: "Safe power picks",
    },
  ];
}

export function getMetaLaneLabel(lane: MetaLaneFilter) {
  return META_LANE_OPTIONS.find((option) => option.value === lane)?.label ?? "All lanes";
}

export function getMetaRoleLabel(role: MetaRoleFilter) {
  return META_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "All roles";
}

export function normalizeMetaLane(value: string | null | undefined): MetaLaneFilter {
  const normalized = value?.trim().toLowerCase();

  if (!normalized || normalized === "all") {
    return "all";
  }

  return MLBB_SUPPORTED_LANES.includes(normalized as HeroLane)
    ? (normalized as HeroLane)
    : "all";
}

export function normalizeMetaRole(value: string | null | undefined): MetaRoleFilter {
  const normalized = value?.trim().toLowerCase();

  if (!normalized || normalized === "all") {
    return "all";
  }

  return Object.hasOwn(META_ROLE_TO_HERO_ROLE, normalized)
    ? (normalized as MetaRoleFilter)
    : "all";
}

export function filterHeroesByLane(heroes: HeroBrowserItem[], lane: MetaLaneFilter) {
  if (lane === "all") {
    return heroes;
  }

  return heroes.filter((hero) => hero.lanes.includes(lane));
}

export function filterHeroesByRole(heroes: HeroBrowserItem[], role: MetaRoleFilter) {
  if (role === "all") {
    return heroes;
  }

  const heroRole = META_ROLE_TO_HERO_ROLE[role];
  return heroes.filter((hero) => hero.roles.includes(heroRole));
}

export function deriveMetaDashboardView(
  heroes: HeroBrowserItem[],
  lane: MetaLaneFilter = "all",
  role: MetaRoleFilter = "all"
): MetaDashboardView {
  const filteredHeroes = filterHeroesByRole(filterHeroesByLane(heroes, lane), role);
  const winBoard = sortByMetric(filteredHeroes, (hero) => hero.winRate);
  const pickBoard = sortByMetric(filteredHeroes, (hero) => hero.pickRate);
  const banBoard = sortByMetric(filteredHeroes, (hero) => hero.banRate);
  const flexHeroes = sortByMetric(
    filteredHeroes.filter((hero) => hero.roles.length > 1),
    (hero) => hero.pickRate
  ).slice(0, 8);
  const contestedHeroes = banBoard.slice(0, 8);

  const roleSnapshots = HERO_ROLES.map((role) => {
    const roleHeroes = filteredHeroes.filter((hero) => hero.roles.includes(role));

    return {
      averageBanRate: average(roleHeroes, (hero) => hero.banRate),
      averagePickRate: average(roleHeroes, (hero) => hero.pickRate),
      averageWinRate: average(roleHeroes, (hero) => hero.winRate),
      count: roleHeroes.length,
      leader: sortByMetric(roleHeroes, (hero) => hero.winRate)[0] ?? null,
      role,
    } satisfies MetaRoleSnapshot;
  });

  const tierSnapshots = HERO_TIERS.map((tier) => {
    const tierHeroes = filteredHeroes.filter((hero) => hero.tier === tier);

    return {
      averagePickRate: average(tierHeroes, (hero) => hero.pickRate),
      averageWinRate: average(tierHeroes, (hero) => hero.winRate),
      count: tierHeroes.length,
      leader: sortByMetric(tierHeroes, (hero) => hero.winRate)[0] ?? null,
      tier,
    } satisfies MetaTierSnapshot;
  });

  return {
    comparisons: buildComparisonGroups(filteredHeroes),
    contestedHeroes,
    filteredHeroes,
    flexHeroes,
    lane,
    role,
    powerBoards: {
      banRate: banBoard.slice(0, 6),
      pickRate: pickBoard.slice(0, 6),
      winRate: winBoard.slice(0, 6),
    },
    roleSnapshots,
    summary: {
      heroCount: filteredHeroes.length,
      laneLabel: getMetaLaneLabel(lane),
      roleLabel: getMetaRoleLabel(role),
      topBanHero: banBoard[0] ?? null,
      topPickHero: pickBoard[0] ?? null,
      topTierCount: filteredHeroes.filter((hero) => hero.tier === "S").length,
      topWinHero: winBoard[0] ?? null,
    },
    tierSnapshots,
  };
}