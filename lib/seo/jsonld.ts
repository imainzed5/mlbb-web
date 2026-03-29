import type { HeroBrowserItem } from "@/lib/heroes/types";
import type { HeroOverview } from "@/lib/hero/types";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "./metadata";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function createWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: SITE_DESCRIPTION,
    name: SITE_NAME,
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: absoluteUrl("/heroes?query={search_term_string}"),
    },
    url: SITE_URL,
  };
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export function createHeroItemListJsonLd(options: {
  description: string;
  heroes: HeroBrowserItem[];
  name: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    description: options.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: options.heroes.slice(0, 30).map((hero, index) => ({
        "@type": "ListItem",
        item: {
          "@type": "Thing",
          image: hero.image ?? undefined,
          name: hero.name,
          url: absoluteUrl(`/heroes/${hero.slug}`),
        },
        position: index + 1,
      })),
      numberOfItems: options.heroes.length,
    },
    name: options.name,
    url: absoluteUrl(options.path),
  };
}

export function createHeroPageJsonLd(hero: HeroOverview) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    description:
      hero.story ||
      `${hero.name} is currently tier ${hero.tier} with a ${hero.winRate.toFixed(1)}% win rate and ${hero.pickRate.toFixed(1)}% pick rate.`,
    mainEntity: {
      "@type": "Thing",
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Tier",
          value: hero.tier,
        },
        {
          "@type": "PropertyValue",
          name: "Primary Role",
          value: hero.primaryRole,
        },
        {
          "@type": "PropertyValue",
          name: "Win Rate",
          value: `${hero.winRate.toFixed(1)}%`,
        },
        {
          "@type": "PropertyValue",
          name: "Pick Rate",
          value: `${hero.pickRate.toFixed(1)}%`,
        },
      ],
      description:
        hero.story ||
        `${hero.name} build, counters, teammates, and current MLBB performance trends.`,
      identifier: String(hero.heroId),
      image: hero.image ?? hero.painting ?? undefined,
      name: hero.name,
      url: absoluteUrl(`/heroes/${hero.slug}`),
    },
    name: `${hero.name} Build, Counters & Stats`,
    url: absoluteUrl(`/heroes/${hero.slug}`),
  };
}