import { cache } from "react";

import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";

import type { HeroCatalogItem } from "./types";

export const getHeroCatalog = cache(async (): Promise<HeroCatalogItem[]> => {
  const heroBrowserData = await getHeroBrowserData();
  return heroBrowserData.heroes;
});

export const getHeroCatalogItemBySlug = cache(
  async (slug: string): Promise<HeroCatalogItem | null> => {
    const heroes = await getHeroCatalog();
    return heroes.find((hero) => hero.slug === slug) ?? null;
  }
);