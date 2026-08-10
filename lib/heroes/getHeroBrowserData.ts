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
import {
  FALLBACK_HERO_BROWSER_ITEMS,
  FALLBACK_HERO_BROWSER_SUMMARY,
  FALLBACK_HERO_SNAPSHOT_AT,
} from "./fallbackSnapshot";
import type { HeroBrowserPayload } from "./types";

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

function createFallbackHeroListRecords(
  positionRecords: RawHeroPositionsRecord[],
  rankRecords: RawHeroRankRecord[]
) {
  const fallbackRecordsByHeroId = new Map<number, RawHeroListRecord>();

  for (const record of positionRecords) {
    const heroId = record.data?.hero_id;
    const heroData = record.data?.hero?.data;
    const name = heroData?.name?.trim();

    if (!heroId || !name) {
      continue;
    }

    fallbackRecordsByHeroId.set(heroId, {
      data: {
        hero_id: heroId,
        hero: {
          data: {
            head: null,
            name,
            smallmap: heroData?.smallmap ?? null,
          },
        },
      },
    });
  }

  for (const record of rankRecords) {
    const heroId = record.data?.main_heroid;
    const heroData = record.data?.main_hero?.data;
    const name = heroData?.name?.trim();

    if (!heroId || !name || fallbackRecordsByHeroId.has(heroId)) {
      continue;
    }

    fallbackRecordsByHeroId.set(heroId, {
      data: {
        hero_id: heroId,
        hero: {
          data: {
            head: heroData?.head ?? null,
            name,
            smallmap: null,
          },
        },
      },
    });
  }

  return [...fallbackRecordsByHeroId.values()];
}

export const getHeroBrowserData = cache(async (
  rank: HeroDetailRank = "all"
): Promise<HeroBrowserPayload> => {
  const [heroListResponse, positionsResponse, rankResponse] = await Promise.all([
    fetchOptionalCollection<RawHeroListRecord>(
      `/heroes?size=${HERO_BROWSER_PAGE_SIZE}&index=1&lang=en`,
      REVALIDATE_WINDOWS.heroes
    ),
    fetchOptionalCollection<RawHeroPositionsRecord>(
      `/heroes/positions?size=${HERO_BROWSER_PAGE_SIZE}&index=1&lang=en`,
      REVALIDATE_WINDOWS.heroes
    ),
    fetchOptionalCollection<RawHeroRankRecord>(
      `/heroes/rank?days=7&rank=${rank}&sort_field=win_rate&sort_order=desc&size=${HERO_BROWSER_PAGE_SIZE}&index=1&lang=en`,
      REVALIDATE_WINDOWS.heroRank
    ),
  ]);

  const positionRecords = positionsResponse?.data.records ?? [];
  const rankRecords = rankResponse?.data.records ?? [];
  const heroRecords =
    heroListResponse?.data.records ??
    createFallbackHeroListRecords(positionRecords, rankRecords);

  const heroes = mergeHeroBrowserRecords(
    heroRecords,
    positionRecords,
    rankRecords
  );
  const usingSnapshot = heroes.length === 0;
  const upstreamStale =
    heroListResponse === null ||
    positionsResponse === null ||
    rankResponse === null;

  return {
    heroes: usingSnapshot ? FALLBACK_HERO_BROWSER_ITEMS : heroes,
    summary: usingSnapshot
      ? FALLBACK_HERO_BROWSER_SUMMARY
      : buildHeroBrowserSummary(heroes),
    generatedAt: new Date().toISOString(),
    stale: upstreamStale || usingSnapshot,
    source: usingSnapshot ? "snapshot" : upstreamStale ? "partial" : "live",
    snapshotAt: usingSnapshot ? FALLBACK_HERO_SNAPSHOT_AT : null,
  };
});
