import { ImageResponse } from "next/og";

import { OgCard } from "@/app/og/OgCard";
import { getHeroCatalogItemBySlug } from "@/lib/hero/getHeroCatalog";

export const alt = "MLBB hero build, counters, teammates, and stat preview";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type HeroOpengraphImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: HeroOpengraphImageProps) {
  const { slug } = await params;
  const hero = await getHeroCatalogItemBySlug(slug);

  return new ImageResponse(
    (
      <OgCard
        eyebrow="Hero Detail"
        title={hero ? `${hero.name} Build, Counters & Stats` : "MLBB Hero Detail"}
        description={
          hero
            ? `${hero.name} is currently tier ${hero.tier} with a ${hero.winRate.toFixed(1)}% win rate and ${hero.pickRate.toFixed(1)}% pick rate.`
            : "Live MLBB hero detail pages with build, matchup, and trend context."
        }
        badges={
          hero
            ? [
                { label: `Tier ${hero.tier}`, tone: "warning" },
                { label: hero.primaryRole, tone: "accent" },
                { label: `${hero.roles.length} roles`, tone: "muted" },
              ]
            : [{ label: "MLBB Stats", tone: "accent" }]
        }
        metrics={
          hero
            ? [
                { label: "Win rate", value: `${hero.winRate.toFixed(1)}%` },
                { label: "Pick rate", value: `${hero.pickRate.toFixed(1)}%` },
                { label: "Ban rate", value: `${hero.banRate.toFixed(1)}%` },
              ]
            : [{ label: "Coverage", value: "Hero Hub" }]
        }
      />
    ),
    size
  );
}