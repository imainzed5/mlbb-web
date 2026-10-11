import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { HeroTrendChart } from "@/components/charts/HeroTrendChart";
import { HeroBuildSheet } from "@/components/hero/HeroBuildSheet";
import { HeroDurationPanel } from "@/components/hero/HeroDurationPanel";
import { HeroInsightPanel } from "@/components/hero/HeroInsightPanel";
import { HeroChipList, HeroMatchupList } from "@/components/hero/HeroMatchupList";
import { HeroWallpaperPreview } from "@/components/hero/HeroWallpaperPreview";
import { GlobalFilters } from "@/components/heroes/GlobalFilters";
import { HeroAvatarImage } from "@/components/heroes/HeroAvatarImage";
import { TierBadge } from "@/components/heroes/TierBadge";
import { winRateTone } from "@/components/heroes/StatCells";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { StateMessage } from "@/components/ui/StateMessage";
import { formatPublicTimestamp } from "@/lib/date-time";
import {
  HERO_DETAIL_DEFAULT_RANK,
  HERO_DETAIL_DEFAULT_TREND_WINDOW,
  normalizeHeroDetailRank,
  normalizeHeroTrendWindow,
} from "@/lib/hero/constants";
import { getHeroCatalogItemBySlug } from "@/lib/hero/getHeroCatalog";
import { getHeroPageData } from "@/lib/hero/getHeroPageData";
import { ROLE_DOT } from "@/lib/heroes/constants";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { createBreadcrumbJsonLd, createHeroPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

type HeroDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rank?: string | string[]; days?: string | string[] }>;
};

const LANE_LABELS: Record<string, string> = { exp: "EXP lane", mid: "Mid lane", roam: "Roam", jungle: "Jungle", gold: "Gold lane" };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export async function generateMetadata({ params }: HeroDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hero = await getHeroCatalogItemBySlug(slug);

  if (!hero) {
    return { robots: { follow: false, index: false }, title: "Hero not found" };
  }

  return createPageMetadata({
    title: `${hero.name} Build, Counters & Stats`,
    description: `${hero.name} is currently tier ${hero.tier} with a ${hero.winRate.toFixed(1)}% win rate and ${hero.pickRate.toFixed(1)}% pick rate in MLBB Stats.`,
    imagePath: `/heroes/${hero.slug}/opengraph-image`,
    keywords: [hero.name, `${hero.name} build`, `${hero.name} counters`, "MLBB hero guide"],
    path: `/heroes/${hero.slug}`,
  });
}

function trendDelta(points: { winRate: number; pickRate: number; banRate: number }[], key: "winRate" | "pickRate" | "banRate") {
  if (points.length < 2) return null;
  return Number((points[points.length - 1][key] - points[0][key]).toFixed(1));
}

function Stat({ label, value, tone, delta, deltaLabel }: { label: string; value: string; tone?: string; delta: number | null; deltaLabel: string }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className={cn("num text-[22px] font-semibold", tone)}>{value}</div>
      <div className="num text-[11.5px]">
        {delta === null ? (
          <span className="text-text-muted">–</span>
        ) : (
          <span className={delta > 0 ? "text-positive" : delta < 0 ? "text-negative" : "text-negative-soft"}>
            {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {Math.abs(delta).toFixed(1)} {deltaLabel}
          </span>
        )}
      </div>
    </div>
  );
}

const sections = [
  ["build", "Build"],
  ["counters", "Counters"],
  ["trends", "Trends"],
  ["combos", "Combos"],
  ["duration", "Duration"],
  ["about", "About"],
  ["artwork", "Artwork"],
] as const;

export default async function HeroDetailPage({ params, searchParams }: HeroDetailPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const rank = normalizeHeroDetailRank(first(query.rank));
  const trendWindow = normalizeHeroTrendWindow(first(query.days));
  const linkQuery = new URLSearchParams({
    ...(rank !== HERO_DETAIL_DEFAULT_RANK ? { rank } : {}),
    ...(trendWindow !== HERO_DETAIL_DEFAULT_TREND_WINDOW ? { days: String(trendWindow) } : {}),
  }).toString();
  const heroQuery = linkQuery ? `?${linkQuery}` : "";

  let heroPageData = null;

  try {
    heroPageData = await getHeroPageData(slug, { rank, trendWindow });
  } catch (error) {
    return (
      <main>
        <PageContainer className="py-8">
          <StateMessage title="Unable to load hero detail" description={getErrorMessage(error)} tone="error" />
        </PageContainer>
      </main>
    );
  }

  if (!heroPageData) {
    notFound();
  }

  const { overview, trends } = heroPageData;
  const weakAgainst = overview.insights.find((insight) => insight.title === "Watch Out For") ?? null;
  const draftInsights = overview.insights.filter((insight) => insight.title !== "Watch Out For");
  const deltaLabel = `in ${trendWindow}d`;

  return (
    <main>
      <JsonLd
        data={[
          createBreadcrumbJsonLd([
            { name: "MLBB Stats", path: "/" },
            { name: "Heroes", path: "/heroes" },
            { name: overview.name, path: `/heroes/${overview.slug}` },
          ]),
          createHeroPageJsonLd(overview),
        ]}
      />

      <div className="border-b border-border-subtle">
        <PageContainer className="py-2.5">
          <Suspense>
            <GlobalFilters trailing={`Synced ${formatPublicTimestamp(heroPageData.generatedAt)}`} />
          </Suspense>
        </PageContainer>
      </div>

      <PageContainer className="space-y-4 py-5 sm:py-6">
        <section className="relative overflow-hidden rounded-lg border border-border-subtle bg-card-surface">
          {overview.painting ? (
            <div className="absolute inset-y-0 right-0 w-full opacity-35 sm:w-2/3">
              <Image src={overview.painting} alt="" fill sizes="(max-width: 640px) 100vw, 66vw" className="object-cover object-[center_25%]" preload />
              <div className="absolute inset-0 bg-gradient-to-r from-card-surface via-card-surface/70 to-transparent" />
            </div>
          ) : null}

          <div className="relative flex flex-wrap items-center gap-5 p-4 sm:p-5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-surface-raised sm:size-24" style={{ borderColor: `var(--tier-${overview.tier.toLowerCase()})` }}>
              <HeroAvatarImage primarySrc={overview.image} fallbackSrc={overview.portrait} alt={overview.name} sizes="96px" preload />
            </div>

            <div className="min-w-0">
              <h1 className="text-[30px] font-bold leading-tight tracking-[-0.03em] sm:text-[34px]">{overview.name}</h1>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11.5px]">
                {overview.roles.map((role) => (
                  <span key={role} className="rounded-sm border border-border-subtle bg-page-background/80 px-2 py-0.5" style={{ color: ROLE_DOT[role] }}>
                    {role}
                  </span>
                ))}
                {overview.lanes.map((lane) => (
                  <span key={lane} className="rounded-sm border border-border-subtle bg-page-background/80 px-2 py-0.5 text-text-secondary">
                    {LANE_LABELS[lane] ?? lane}
                  </span>
                ))}
                {overview.specialties.slice(0, 2).map((specialty) => (
                  <span key={specialty} className="rounded-sm border border-border-subtle bg-page-background/80 px-2 py-0.5 text-text-secondary">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-wrap gap-x-7 gap-y-3 sm:ml-auto sm:w-auto">
              <div>
                <div className="eyebrow">Tier</div>
                <TierBadge tier={overview.tier} size="lg" className="mt-0.5" />
              </div>
              <Stat label="Win rate" value={`${overview.winRate.toFixed(1)}%`} tone={winRateTone(overview.winRate)} delta={trendDelta(trends, "winRate")} deltaLabel={deltaLabel} />
              <Stat label="Pick rate" value={`${overview.pickRate.toFixed(1)}%`} delta={trendDelta(trends, "pickRate")} deltaLabel={deltaLabel} />
              <Stat label="Ban rate" value={`${overview.banRate.toFixed(1)}%`} tone={overview.banRate >= 20 ? "text-tier-s" : undefined} delta={trendDelta(trends, "banRate")} deltaLabel={deltaLabel} />
            </div>
          </div>
        </section>

        <nav aria-label="Hero sections" className="sticky top-14 z-30 -mx-4 flex gap-5 wide:hidden overflow-x-auto border-b border-border-subtle bg-page-background/95 px-4 text-[13px] backdrop-blur sm:mx-0 sm:px-0">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="border-b-2 border-transparent py-2.5 whitespace-nowrap text-text-secondary hover:border-border-strong hover:text-text-primary">
              {label}
            </a>
          ))}
        </nav>

        {heroPageData.stale ? (
          <p className="text-[12px] text-text-muted">Some sections are using backup data while the latest hero updates catch up.</p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] wide:grid-cols-[200px_minmax(0,1fr)_380px]">
          <aside className="hidden wide:block">
            <div className="sticky top-20 space-y-4">
              <nav aria-label="Hero sections" className="flex flex-col border-l border-border-subtle text-[13px]">
                {sections.map(([id, label]) => (
                  <a key={id} href={`#${id}`} className="-ml-px border-l-2 border-transparent py-1.5 pl-3 text-text-secondary hover:border-accent-primary hover:text-text-primary">
                    {label}
                  </a>
                ))}
              </nav>
              <dl className="space-y-2.5 rounded-lg border border-border-subtle bg-card-surface p-3 text-[12px]">
                <div>
                  <dt className="eyebrow">Roles</dt>
                  <dd className="mt-0.5">{overview.roles.join(" / ")}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Lanes</dt>
                  <dd className="mt-0.5">{overview.lanes.map((lane) => LANE_LABELS[lane] ?? lane).join(", ") || "–"}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Difficulty</dt>
                  <dd className="num mt-0.5">{overview.difficulty.toFixed(0)} / 100</dd>
                </div>
                {overview.specialties.length > 0 ? (
                  <div>
                    <dt className="eyebrow">Specialties</dt>
                    <dd className="mt-0.5 text-text-secondary">{overview.specialties.join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </aside>

          <div className="min-w-0 space-y-4">
            <section id="build" className="scroll-mt-28">
              <HeroBuildSheet heroName={overview.name} plans={heroPageData.builds} skillPriority={overview.skillPriority} />
            </section>

            <section id="trends" className="scroll-mt-28 rounded-lg border border-border-subtle bg-card-surface p-4">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="text-[14px] font-semibold">Trends</h2>
                <span className="text-[11.5px] text-text-muted">Last {trendWindow} days</span>
              </div>
              {trends.length > 0 ? (
                <HeroTrendChart points={trends} />
              ) : (
                <p className="text-[12.5px] text-text-secondary">Not enough recent history to chart this window yet.</p>
              )}
            </section>

            {draftInsights.length > 0 ? <HeroInsightPanel insights={draftInsights} /> : null}

            <section id="combos" className="scroll-mt-28 rounded-lg border border-border-subtle bg-card-surface p-4">
              <h2 className="mb-3 text-[14px] font-semibold">Skill combos</h2>
              {heroPageData.combos.length > 0 ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {heroPageData.combos.map((combo, comboIndex) => (
                    <article key={`${combo.title}-${comboIndex}`} className="space-y-2 rounded-md border border-border-subtle bg-page-background p-3">
                      <div className="text-[13px] font-semibold">{combo.title}</div>
                      {combo.icons.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {combo.icons.map((icon, iconIndex) => (
                            <div key={`${icon.skillId}-${iconIndex}`} className="relative size-9 overflow-hidden rounded-md border border-border-strong bg-surface-raised">
                              {icon.icon ? <Image src={icon.icon} alt={`Skill ${icon.skillId}`} fill sizes="36px" className="object-cover" /> : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {combo.description ? <p className="text-[12px] leading-5 text-text-secondary">{combo.description}</p> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] text-text-secondary">No combo notes have been published for this hero yet.</p>
              )}
            </section>

            <div id="duration" className="scroll-mt-28">
              <Suspense>
                <HeroDurationPanel heroId={overview.heroId} />
              </Suspense>
            </div>

            <section id="about" className="scroll-mt-28 rounded-lg border border-border-subtle bg-card-surface p-4">
              <h2 className="mb-3 text-[14px] font-semibold">About {overview.name}</h2>
              <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {overview.attributes.map((attribute) => (
                  <div key={attribute.label}>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-text-secondary">{attribute.label}</span>
                      <span className="num">{attribute.value.toFixed(0)}</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-border-strong">
                      <div className="h-full rounded-full bg-accent-primary" style={{ width: `${attribute.value}%` }} />
                    </div>
                  </div>
                ))}
                <div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-text-secondary">Difficulty</span>
                    <span className="num">{overview.difficulty.toFixed(0)}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-border-strong">
                    <div className="h-full rounded-full bg-tier-s" style={{ width: `${overview.difficulty}%` }} />
                  </div>
                </div>
              </div>
              {overview.story ? <p className="mt-4 max-w-[70ch] text-[13px] leading-6 text-text-secondary">{overview.story}</p> : null}
            </section>

            <div id="artwork" className="scroll-mt-28">
              <Suspense fallback={<p className="text-sm text-text-secondary">Loading hero artwork…</p>}>
                <HeroWallpaperPreview heroId={overview.heroId} slug={overview.slug} />
              </Suspense>
            </div>
          </div>

          <aside id="counters" className="scroll-mt-28 space-y-4 self-start lg:sticky lg:top-28">
            {weakAgainst ? (
              <HeroChipList title="Weak against" description={weakAgainst.description} heroes={weakAgainst.heroes} query={heroQuery} />
            ) : null}
            <HeroMatchupList
              title="Strong against"
              hint="Δ win rate"
              emptyText="No clear matchup edges in this rank and window."
              items={heroPageData.counters}
              query={heroQuery}
            />
            <HeroMatchupList
              title="Best teammates"
              hint="Δ win rate together"
              emptyText="No standout teammate pairings in this rank and window."
              items={heroPageData.teammates}
              query={heroQuery}
            />
          </aside>
        </div>
      </PageContainer>
    </main>
  );
}
