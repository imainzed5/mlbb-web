import { cache } from "react";

import { REVALIDATE_WINDOWS } from "@/lib/mlbb/cache";
import { fetchMlbbCollection } from "@/lib/mlbb/client";
import type { RawHeroDetailRecord } from "@/lib/hero/types";

export type HeroFeatureVisual = {
  primarySrc: string | null;
  fallbackSrc: string | null;
};

function readImageSource(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export const getHeroFeatureVisual = cache(
  async (heroId: number): Promise<HeroFeatureVisual> => {
    try {
      const response = await fetchMlbbCollection<RawHeroDetailRecord>(
        `/heroes/${heroId}?lang=en`,
        { revalidate: REVALIDATE_WINDOWS.heroDetail }
      );
      const detail = response.data.records[0]?.data;
      const heroData = detail?.hero?.data;
      const sources = [
        readImageSource(detail?.head_big),
        readImageSource(heroData?.painting),
        readImageSource(heroData?.squareheadbig),
        readImageSource(detail?.head),
        readImageSource(heroData?.head),
        readImageSource(heroData?.smallmap),
      ].filter((source): source is string => source !== null);

      return {
        primarySrc: sources[0] ?? null,
        fallbackSrc: sources[1] ?? null,
      };
    } catch {
      return {
        primarySrc: null,
        fallbackSrc: null,
      };
    }
  }
);
