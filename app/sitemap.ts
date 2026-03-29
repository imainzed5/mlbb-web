import type { MetadataRoute } from "next";

import { getHeroCatalog } from "@/lib/hero/getHeroCatalog";
import { absoluteUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const heroes = await getHeroCatalog();
  const lastModified = new Date();

  return [
    {
      changeFrequency: "daily",
      lastModified,
      priority: 1,
      url: absoluteUrl("/"),
    },
    {
      changeFrequency: "daily",
      lastModified,
      priority: 0.9,
      url: absoluteUrl("/heroes"),
    },
    {
      changeFrequency: "daily",
      lastModified,
      priority: 0.8,
      url: absoluteUrl("/heroes/rank"),
    },
    {
      changeFrequency: "daily",
      lastModified,
      priority: 0.7,
      url: absoluteUrl("/meta"),
    },
    ...heroes.map((hero) => ({
      changeFrequency: "daily" as const,
      images: hero.image ? [hero.image] : undefined,
      lastModified,
      priority: 0.7,
      url: absoluteUrl(`/heroes/${hero.slug}`),
    })),
  ];
}