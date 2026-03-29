import { cache } from "react";

import { REVALIDATE_WINDOWS } from "@/lib/mlbb/cache";
import { fetchMlbbCollection } from "@/lib/mlbb/client";

import {
  createFallbackHeroOverview,
  normalizeHeroBuildPlans,
  normalizeHeroCombos,
  normalizeHeroMatchups,
  normalizeHeroOverview,
  normalizeHeroTrends,
} from "./normalizers";
import {
  HERO_DETAIL_DEFAULT_RANK,
  HERO_DETAIL_DEFAULT_TREND_WINDOW,
  normalizeHeroDetailRank,
  normalizeHeroTrendWindow,
} from "./constants";
import { getHeroCatalog, getHeroCatalogItemBySlug } from "./getHeroCatalog";
import type {
  HeroDetailFilters,
  HeroPageData,
  RawHeroDetailRecord,
  RawHeroMatchupRecord,
  RawHeroSkillComboRecord,
  RawHeroTrendRecord,
} from "./types";

async function fetchOptionalCollection<RecordType>(
  path: string,
  revalidate: number
) {
  try {
    return await fetchMlbbCollection<RecordType>(path, { revalidate });
  } catch {
    return null;
  }
}

const getHeroPageDataCached = cache(
  async (
    slug: string,
    rank: HeroDetailFilters["rank"],
    trendWindow: HeroDetailFilters["trendWindow"]
  ): Promise<HeroPageData | null> => {
    const [catalog, hero] = await Promise.all([
      getHeroCatalog(),
      getHeroCatalogItemBySlug(slug),
    ]);

    if (!hero) {
      return null;
    }

    const catalogById = new Map(catalog.map((item) => [item.heroId, item]));
    const heroIdentifier = hero.heroId;
    const [detailResponse, countersResponse, teammatesResponse, trendsResponse, comboResponse] =
      await Promise.all([
        fetchOptionalCollection<RawHeroDetailRecord>(
          `/heroes/${heroIdentifier}?lang=en`,
          REVALIDATE_WINDOWS.heroDetail
        ),
        fetchOptionalCollection<RawHeroMatchupRecord>(
          `/heroes/${heroIdentifier}/counters?rank=${rank}&lang=en`,
          REVALIDATE_WINDOWS.heroDetail
        ),
        fetchOptionalCollection<RawHeroMatchupRecord>(
          `/heroes/${heroIdentifier}/compatibility?rank=${rank}&lang=en`,
          REVALIDATE_WINDOWS.heroDetail
        ),
        fetchOptionalCollection<RawHeroTrendRecord>(
          `/heroes/${heroIdentifier}/trends?rank=${rank}&past-days=${trendWindow}&lang=en`,
          REVALIDATE_WINDOWS.heroDetail
        ),
        fetchOptionalCollection<RawHeroSkillComboRecord>(
          `/heroes/${heroIdentifier}/skill-combos?lang=en`,
          REVALIDATE_WINDOWS.heroDetail
        ),
      ]);

    const detailRecord = detailResponse?.data.records[0] ?? null;

    return {
      builds: normalizeHeroBuildPlans(detailRecord),
      combos: normalizeHeroCombos(comboResponse?.data.records ?? []),
      counters: normalizeHeroMatchups(countersResponse?.data.records ?? [], catalogById),
      filters: {
        rank,
        trendWindow,
      },
      generatedAt: new Date().toISOString(),
      overview: detailRecord
        ? normalizeHeroOverview(hero, detailRecord, catalogById)
        : createFallbackHeroOverview(hero),
      stale:
        detailResponse === null ||
        countersResponse === null ||
        teammatesResponse === null ||
        trendsResponse === null ||
        comboResponse === null,
      teammates: normalizeHeroMatchups(teammatesResponse?.data.records ?? [], catalogById),
      trends: normalizeHeroTrends(trendsResponse?.data.records ?? []),
    };
  }
);

export async function getHeroPageData(
  slug: string,
  filters?: Partial<HeroDetailFilters>
) {
  const rank = normalizeHeroDetailRank(filters?.rank ?? HERO_DETAIL_DEFAULT_RANK);
  const trendWindow = normalizeHeroTrendWindow(
    filters?.trendWindow ?? HERO_DETAIL_DEFAULT_TREND_WINDOW
  );

  return getHeroPageDataCached(slug, rank, trendWindow);
}