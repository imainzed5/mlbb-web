import type { MetadataRoute } from "next";

import { getHeroCatalog } from "@/lib/hero/getHeroCatalog";
import { getAcademyCatalog } from "@/lib/academy/catalog";
import { absoluteUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [heroes, catalogs] = await Promise.all([getHeroCatalog(), Promise.all((["items", "spells", "emblems"] as const).map(getAcademyCatalog))]);
  const lastModified = new Date();

  return [
    ...["/academy", "/academy/items", "/academy/spells", "/academy/emblems", "/esports", "/esports/ph", "/esports/id", "/tools", "/tools/win-rate", "/wallpapers"].map(path => ({ url: absoluteUrl(path), lastModified, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...catalogs.flatMap(catalog => catalog.entries.map(entry => ({ url: absoluteUrl(`/academy/${entry.kind}/${entry.id}`), lastModified, changeFrequency: "weekly" as const, priority: 0.5 }))),
    ...heroes.map(hero => ({ url: absoluteUrl(`/heroes/${hero.slug}/wallpapers`), lastModified, changeFrequency: "weekly" as const, priority: 0.5 })),
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
