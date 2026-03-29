import { createHeroSlug } from "@/lib/mlbb/slugs";
import type {
  RawHeroLaneNode,
  RawHeroListRecord,
  RawHeroPositionsRecord,
  RawHeroRankRecord,
  RawHeroRoleNode,
} from "@/lib/mlbb/types";

import { HERO_TIER_ORDER } from "./constants";
import type {
  HeroBrowserItem,
  HeroBrowserSummary,
  HeroLane,
  HeroRole,
  HeroTier,
} from "./types";

function toPercent(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  const normalized = value <= 1 ? value * 100 : value;
  return Number(normalized.toFixed(1));
}

function normalizeRoleValue(value: string | null | undefined): HeroRole | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case "fighter":
      return "Fighter";
    case "mage":
      return "Mage";
    case "assassin":
      return "Assassin";
    case "tank":
      return "Tank";
    case "support":
      return "Support";
    case "marksman":
      return "Marksman";
    default:
      return null;
  }
}

function normalizeLaneValue(value: string | null | undefined): HeroLane | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized.includes("exp")) {
    return "exp";
  }

  if (normalized.includes("mid")) {
    return "mid";
  }

  if (normalized.includes("roam")) {
    return "roam";
  }

  if (normalized.includes("jungle")) {
    return "jungle";
  }

  if (normalized.includes("gold")) {
    return "gold";
  }

  return null;
}

function uniqueValues<T>(items: Array<T | null | undefined>): T[] {
  return Array.from(new Set(items.filter((item): item is T => item != null)));
}

function readRoleNode(node: RawHeroRoleNode) {
  return normalizeRoleValue(node && typeof node === "object" ? node.data?.sort_title : null);
}

function readLaneNode(node: RawHeroLaneNode) {
  return normalizeLaneValue(
    node && typeof node === "object" ? node.data?.road_sort_title : null
  );
}

function getTierByIndex(index: number, total: number): HeroTier {
  const percentile = total === 0 ? 1 : index / total;

  if (percentile < 0.12) {
    return "S";
  }

  if (percentile < 0.35) {
    return "A";
  }

  if (percentile < 0.65) {
    return "B";
  }

  return "C";
}

export function mergeHeroBrowserRecords(
  heroRecords: RawHeroListRecord[],
  positionRecords: RawHeroPositionsRecord[],
  rankRecords: RawHeroRankRecord[]
) {
  const positionsByHeroId = new Map<
    number,
    {
      roles: HeroRole[];
      lanes: HeroLane[];
    }
  >();
  const rankByHeroId = new Map<
    number,
    {
      winRate: number;
      pickRate: number;
      banRate: number;
    }
  >();

  for (const record of positionRecords) {
    const heroId = record.data?.hero_id;

    if (!heroId) {
      continue;
    }

    const heroData = record.data?.hero?.data;

    positionsByHeroId.set(heroId, {
      roles: uniqueValues((heroData?.sortid ?? []).map(readRoleNode)),
      lanes: uniqueValues((heroData?.roadsort ?? []).map(readLaneNode)),
    });
  }

  for (const record of rankRecords) {
    const heroId = record.data?.main_heroid;

    if (!heroId) {
      continue;
    }

    rankByHeroId.set(heroId, {
      winRate: toPercent(record.data?.main_hero_win_rate),
      pickRate: toPercent(record.data?.main_hero_appearance_rate),
      banRate: toPercent(record.data?.main_hero_ban_rate),
    });
  }

  const mergedHeroes = heroRecords
    .map((record) => {
      const heroId = record.data?.hero_id;
      const heroData = record.data?.hero?.data;
      const name = heroData?.name?.trim();

      if (!heroId || !name) {
        return null;
      }

      const roleEntry = positionsByHeroId.get(heroId);
      const rankEntry = rankByHeroId.get(heroId);
      const roles: HeroRole[] = roleEntry?.roles.length
        ? roleEntry.roles
        : ["Fighter"];
      const slug = createHeroSlug(name) || `hero-${heroId}`;

      return {
        heroId,
        slug,
        name,
        image: heroData?.head ?? null,
        smallmap: heroData?.smallmap ?? null,
        roles,
        primaryRole: roles[0],
        lanes: roleEntry?.lanes ?? [],
        winRate: rankEntry?.winRate ?? 0,
        pickRate: rankEntry?.pickRate ?? 0,
        banRate: rankEntry?.banRate ?? 0,
        tier: "C" as HeroTier,
        tierOrder: HERO_TIER_ORDER.C,
      } satisfies HeroBrowserItem;
    })
    .filter((hero): hero is HeroBrowserItem => hero !== null);

  const heroesByTier = [...mergedHeroes].sort((heroA, heroB) => {
    if (heroA.winRate !== heroB.winRate) {
      return heroB.winRate - heroA.winRate;
    }

    if (heroA.pickRate !== heroB.pickRate) {
      return heroB.pickRate - heroA.pickRate;
    }

    return heroA.name.localeCompare(heroB.name);
  });

  const tierByHeroId = new Map<number, { tier: HeroTier; tierOrder: number }>();

  heroesByTier.forEach((hero, index) => {
    const tier = getTierByIndex(index, heroesByTier.length);

    tierByHeroId.set(hero.heroId, {
      tier,
      tierOrder: HERO_TIER_ORDER[tier],
    });
  });

  return mergedHeroes
    .map((hero) => ({
      ...hero,
      tier: tierByHeroId.get(hero.heroId)?.tier ?? hero.tier,
      tierOrder: tierByHeroId.get(hero.heroId)?.tierOrder ?? hero.tierOrder,
    }))
    .sort((heroA, heroB) => {
      if (heroA.winRate !== heroB.winRate) {
        return heroB.winRate - heroA.winRate;
      }

      if (heroA.pickRate !== heroB.pickRate) {
        return heroB.pickRate - heroA.pickRate;
      }

      return heroA.name.localeCompare(heroB.name);
    });
}

export function buildHeroBrowserSummary(heroes: HeroBrowserItem[]): HeroBrowserSummary {
  const highestWinRateHero = heroes[0]
    ? {
        name: heroes[0].name,
        slug: heroes[0].slug,
        winRate: heroes[0].winRate,
      }
    : null;

  return {
    totalHeroes: heroes.length,
    fightersCount: heroes.filter((hero) => hero.roles.includes("Fighter")).length,
    magesCount: heroes.filter((hero) => hero.roles.includes("Mage")).length,
    highestWinRateHero,
  };
}