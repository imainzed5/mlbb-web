import type { HeroBrowserItem } from "@/lib/heroes/types";

import type {
  HeroBuildPlan,
  HeroCatalogItem,
  HeroCombo,
  HeroInsight,
  HeroMatchupEntry,
  HeroOverview,
  HeroReference,
  HeroTrendPoint,
  RawHeroDetailRecord,
  RawHeroEmblemSkillNode,
  RawHeroMatchupRecord,
  RawHeroRecommendedPlan,
  RawHeroRelationBranch,
  RawHeroSkillComboRecord,
  RawHeroTrendRecord,
} from "./types";

const ABILITY_LABELS = ["Durability", "Offense", "Effects", "Difficulty"];

function normalizeTextInput(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(normalizeTextInput).filter(Boolean).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = Number.parseFloat(value);
    return Number.isFinite(normalized) ? normalized : 0;
  }

  return 0;
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Number(value.toFixed(1))));
}

function toPercent(value: number | string | null | undefined) {
  const normalized = toNumber(value);
  return normalized <= 1 ? clampPercent(normalized * 100) : clampPercent(normalized);
}

function cleanText(value: unknown) {
  const normalizedValue = normalizeTextInput(value);

  if (!normalizedValue) {
    return "";
  }

  return normalizedValue
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?.*?>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitCopy(value: unknown) {
  return cleanText(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeSpecialties(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }

  const cleaned = cleanText(value);

  if (!cleaned) {
    return [];
  }

  return cleaned
    .split(/\s*\/\s*|\s*,\s*|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveHeroReference(
  heroId: number | null | undefined,
  catalogById: Map<number, HeroCatalogItem>,
  fallbackImage?: string | null
): HeroReference | null {
  if (!heroId || heroId <= 0) {
    return null;
  }

  const catalogHero = catalogById.get(heroId);

  if (!catalogHero) {
    return null;
  }

  return {
    heroId: catalogHero.heroId,
    image: fallbackImage ?? catalogHero.image,
    name: catalogHero.name,
    primaryRole: catalogHero.primaryRole,
    slug: catalogHero.slug,
    tier: catalogHero.tier,
  };
}

function normalizeInsight(
  title: string,
  branch: RawHeroRelationBranch | null | undefined,
  catalogById: Map<number, HeroCatalogItem>
): HeroInsight | null {
  const description = cleanText(branch?.desc);

  if (!description) {
    return null;
  }

  const targetIds = branch?.target_hero_id ?? [];
  const targetImages = branch?.target_hero ?? [];
  const heroes = targetIds
    .map((heroId, index) => {
      const imageNode = targetImages[index];
      const fallbackImage =
        imageNode && typeof imageNode === "object" ? imageNode.data?.head ?? null : null;

      return resolveHeroReference(heroId, catalogById, fallbackImage);
    })
    .filter((hero): hero is HeroReference => hero !== null);

  return {
    description,
    heroes,
    title,
  };
}

function normalizeTalent(node: RawHeroEmblemSkillNode | null | undefined) {
  const name = cleanText(node?.emblemskill?.skillname);

  if (!name) {
    return null;
  }

  return {
    description:
      cleanText(node?.emblemskill?.skilldesc) ||
      cleanText(node?.emblemskill?.skilldescemblem) ||
      null,
    icon: node?.emblemskill?.skillicon ?? null,
    name,
    tier: node?.gifttiers ?? null,
  };
}

function normalizeBuildPlan(plan: RawHeroRecommendedPlan): HeroBuildPlan | null {
  const title = cleanText(plan.title) || "Recommended build";
  const items = (plan.equiplist ?? [])
    .map((item) => {
      const name = cleanText(item.equipname);

      if (!name) {
        return null;
      }

      return {
        icon: item.equipicon ?? null,
        name,
        passiveText: splitCopy(item.equipskilldesc),
        statText: splitCopy(item.equiptips),
        typeLabel: cleanText(item.equiptypename) || null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const talents = [
    normalizeTalent(plan.emblemplan?.giftid1),
    normalizeTalent(plan.emblemplan?.giftid2),
    normalizeTalent(plan.emblemplan?.giftid3),
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const emblemName = cleanText(plan.emblemplan?.emblemplan?.emblemname);
  const emblem = emblemName || talents.length
    ? {
        bonuses: splitCopy(plan.emblemplan?.emblemplan?.emblemattr?.emblemattr),
        icon: plan.emblemplan?.emblemplan?.attriicon ?? null,
        name: emblemName || "Recommended emblem",
        talents,
      }
    : null;

  const battleSpellName = cleanText(plan.battleskill?.__data?.skillname);
  const battleSpell = battleSpellName
    ? {
        description:
          cleanText(plan.battleskill?.__data?.skilldesc) ||
          cleanText(plan.battleskill?.__data?.skilldescemblem) ||
          null,
        icon: plan.battleskill?.__data?.skillicon ?? null,
        name: battleSpellName,
      }
    : null;

  return {
    battleSpell,
    creatorAvatar: plan.face ?? null,
    creatorName: cleanText(plan.name) || null,
    description: cleanText(plan.description) || null,
    emblem,
    items,
    title,
  };
}

export function createFallbackHeroOverview(hero: HeroBrowserItem): HeroOverview {
  return {
    attributes: ABILITY_LABELS.map((label) => ({ label, value: 0 })),
    banRate: hero.banRate,
    difficulty: 0,
    heroId: hero.heroId,
    image: hero.image,
    insights: [],
    lanes: hero.lanes,
    name: hero.name,
    painting: hero.image,
    pickRate: hero.pickRate,
    portrait: hero.image,
    primaryRole: hero.primaryRole,
    roles: hero.roles,
    skillPriority: [],
    slug: hero.slug,
    specialties: [],
    story: null,
    tier: hero.tier,
    winRate: hero.winRate,
  };
}

export function normalizeHeroOverview(
  hero: HeroBrowserItem,
  detailRecord: RawHeroDetailRecord,
  catalogById: Map<number, HeroCatalogItem>
): HeroOverview {
  const heroData = detailRecord.data?.hero?.data;
  const abilityValues = Array.isArray(heroData?.abilityshow)
    ? heroData.abilityshow.map((value) => clampPercent(toNumber(value))).slice(0, 4)
    : [];
  const insights = [
    normalizeInsight("Best With", detailRecord.data?.relation?.assist, catalogById),
    normalizeInsight("Favored Into", detailRecord.data?.relation?.strong, catalogById),
    normalizeInsight("Watch Out For", detailRecord.data?.relation?.weak, catalogById),
  ].filter((item): item is HeroInsight => item !== null);

  return {
    attributes: ABILITY_LABELS.map((label, index) => ({
      label,
      value:
        abilityValues[index] ??
        (index === ABILITY_LABELS.length - 1
          ? clampPercent(toNumber(heroData?.difficulty))
          : 0),
    })),
    banRate: hero.banRate,
    difficulty: clampPercent(toNumber(heroData?.difficulty)),
    heroId: hero.heroId,
    image: heroData?.head ?? detailRecord.data?.head ?? hero.image,
    insights,
    lanes: hero.lanes,
    name: hero.name,
    painting: heroData?.painting ?? detailRecord.data?.head_big ?? hero.image,
    pickRate: hero.pickRate,
    portrait:
      heroData?.squareheadbig ??
      heroData?.squarehead ??
      detailRecord.data?.head_big ??
      hero.image,
    primaryRole: hero.primaryRole,
    roles: hero.roles,
    skillPriority: (heroData?.recommendlevellabel ?? "")
      .split("-")
      .map((value) => value.trim())
      .filter(Boolean),
    slug: hero.slug,
    specialties: normalizeSpecialties(heroData?.speciality),
    story: cleanText(heroData?.story) || cleanText(heroData?.tale) || null,
    tier: hero.tier,
    winRate: hero.winRate,
  };
}

export function normalizeHeroBuildPlans(detailRecord: RawHeroDetailRecord | null) {
  const plans = detailRecord?.data?.hero?.data?.recommendmasterplan ?? [];

  return plans
    .map(normalizeBuildPlan)
    .filter((plan): plan is HeroBuildPlan => plan !== null);
}

export function normalizeHeroCombos(comboRecords: RawHeroSkillComboRecord[]) {
  return comboRecords
    .map((record) => {
      const title = cleanText(record.data?.title) || "Skill combo";
      const description = cleanText(record.data?.desc) || null;
      const icons = (record.data?.skill_id ?? [])
        .map((node) => {
          const skillId = node.data?.skillid;
          const icon = node.data?.skillicon ?? null;

          if (!skillId) {
            return null;
          }

          return {
            icon,
            skillId,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (!title && !description && icons.length === 0) {
        return null;
      }

      return {
        description,
        icons,
        title,
      } satisfies HeroCombo;
    })
    .filter((combo): combo is HeroCombo => combo !== null);
}

export function normalizeHeroMatchups(
  records: RawHeroMatchupRecord[],
  catalogById: Map<number, HeroCatalogItem>
) {
  const primaryRecord = records[0];
  const subHeroes = primaryRecord?.data?.sub_hero ?? [];

  return subHeroes
    .map((entry) => {
      const hero = resolveHeroReference(
        entry.heroid,
        catalogById,
        entry.hero?.data?.head ?? null
      );

      if (!hero) {
        return null;
      }

      return {
        ...hero,
        appearanceRate: toPercent(entry.hero_appearance_rate),
        deltaWinRate: toPercent(entry.increase_win_rate),
        heroWinRate: toPercent(entry.hero_win_rate),
      } satisfies HeroMatchupEntry;
    })
    .filter((entry): entry is HeroMatchupEntry => entry !== null)
    .sort((entryA, entryB) => {
      if (entryA.deltaWinRate !== entryB.deltaWinRate) {
        return entryB.deltaWinRate - entryA.deltaWinRate;
      }

      if (entryA.heroWinRate !== entryB.heroWinRate) {
        return entryB.heroWinRate - entryA.heroWinRate;
      }

      return entryA.name.localeCompare(entryB.name);
    });
}

export function normalizeHeroTrends(records: RawHeroTrendRecord[]) {
  const primaryRecord = records[0];
  const points = primaryRecord?.data?.win_rate ?? [];

  return points
    .map((point) => {
      const date = point.date?.trim();

      if (!date) {
        return null;
      }

      return {
        banRate: toPercent(point.ban_rate),
        date,
        pickRate: toPercent(point.app_rate),
        winRate: toPercent(point.win_rate),
      } satisfies HeroTrendPoint;
    })
    .filter((point): point is HeroTrendPoint => point !== null)
    .sort((pointA, pointB) => pointA.date.localeCompare(pointB.date));
}