import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { GlobalFilters } from "@/components/heroes/GlobalFilters";
import { TierListClient } from "@/components/heroes/TierListClient";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { StateMessage } from "@/components/ui/StateMessage";
import { formatPublicTimestamp } from "@/lib/date-time";
import {
  HERO_DETAIL_DEFAULT_RANK,
  HERO_DETAIL_DEFAULT_TREND_WINDOW,
  HERO_DETAIL_RANK_OPTIONS,
  normalizeHeroDetailRank,
  normalizeHeroTrendWindow,
} from "@/lib/hero/constants";
import { getHeroTierList } from "@/lib/heroes/getHeroTierList";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { createHeroItemListJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

const description =
  "MLBB hero tier list ranked by win, pick, and ban rate, filterable by rank bracket, role, and time window.";

export const metadata: Metadata = createPageMetadata({
  title: "Hero Tier List",
  description,
  imagePath: "/heroes/opengraph-image",
  path: "/heroes",
});

type HeroesPageProps = {
  searchParams: Promise<{ rank?: string | string[]; days?: string | string[] }>;
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function HeroesPage({ searchParams }: HeroesPageProps) {
  await connection();
  const params = await searchParams;
  const rank = normalizeHeroDetailRank(first(params.rank));
  const days = normalizeHeroTrendWindow(first(params.days));
  const rankLabel = HERO_DETAIL_RANK_OPTIONS.find((option) => option.value === rank)?.label ?? "All ranks";
  const query = new URLSearchParams({
    ...(rank !== HERO_DETAIL_DEFAULT_RANK ? { rank } : {}),
    ...(days !== HERO_DETAIL_DEFAULT_TREND_WINDOW ? { days: String(days) } : {}),
  }).toString();

  let data: Awaited<ReturnType<typeof getHeroTierList>> | null = null;
  let loadError: unknown = null;

  try {
    data = await getHeroTierList(rank, days);
  } catch (error) {
    loadError = error;
  }

  const syncedAt = data ? formatPublicTimestamp(data.generatedAt) : null;
  const content = data ? (
    <>
      <JsonLd data={createHeroItemListJsonLd({ description, heroes: data.heroes, name: "MLBB Hero Tier List", path: "/heroes" })} />
      <TierListClient
        key={`${rank}-${days}`}
        heroes={data.heroes}
        hasDelta={data.baselineDays !== null}
        baselineLabel={`vs ${data.baselineDays}d`}
        query={query ? `?${query}` : ""}
      />
      {data.stale ? (
        <StateMessage
          title={data.source === "snapshot" ? "Showing a saved snapshot" : "Some data may be out of date"}
          description={
            data.source === "snapshot"
              ? "The live MLBB API is unavailable, so this list comes from a saved snapshot. Live numbers return automatically."
              : "One or more data sources were unavailable during the last sync."
          }
          tone="muted"
        />
      ) : null}
    </>
  ) : (
    <StateMessage title="Unable to load the tier list" description={getErrorMessage(loadError)} tone="error" />
  );

  return (
    <main>
      <div className="border-b border-border-subtle">
        <PageContainer className="py-2.5">
          <Suspense>
            <GlobalFilters trailing={syncedAt ? `Synced ${syncedAt}` : null} />
          </Suspense>
        </PageContainer>
      </div>
      <PageContainer className="space-y-5 py-6 sm:py-8">
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-balance">Hero Tier List</h1>
          <p className="mt-1 max-w-[62ch] text-[13px] text-text-secondary">
            Every hero ranked by win, pick and ban rate · {rankLabel} · last {days} days. Tiers are win-rate percentiles: top 12% S, next 23% A, next 30% B.
          </p>
        </div>
        {content}
      </PageContainer>
    </main>
  );
}
