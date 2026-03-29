import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { HeroBuildPlanCard } from "@/components/hero/HeroBuildPlanCard";
import { HeroDetailExplorer } from "@/components/hero/HeroDetailExplorer";
import { HeroMatchupList } from "@/components/hero/HeroMatchupList";
import { RoleBadge } from "@/components/heroes/RoleBadge";
import { TierBadge } from "@/components/heroes/TierBadge";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { StateMessage } from "@/components/ui/StateMessage";
import { getHeroCatalog, getHeroCatalogItemBySlug } from "@/lib/hero/getHeroCatalog";
import { getHeroPageData } from "@/lib/hero/getHeroPageData";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { createBreadcrumbJsonLd, createHeroPageJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

type HeroDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function getHeroInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function generateStaticParams() {
  const heroes = await getHeroCatalog();
  return heroes.map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata({
  params,
}: HeroDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hero = await getHeroCatalogItemBySlug(slug);

  if (!hero) {
    return {
      robots: {
        follow: false,
        index: false,
      },
      title: "Hero not found",
    };
  }

  return createPageMetadata({
    title: `${hero.name} Build, Counters & Stats`,
    description: `${hero.name} is currently tier ${hero.tier} with a ${hero.winRate.toFixed(1)}% win rate and ${hero.pickRate.toFixed(1)}% pick rate in MLBB Stats.`,
    imagePath: `/heroes/${hero.slug}/opengraph-image`,
    keywords: [hero.name, `${hero.name} build`, `${hero.name} counters`, "MLBB hero guide"],
    path: `/heroes/${hero.slug}`,
  });
}

export default async function HeroDetailPage({ params }: HeroDetailPageProps) {
  const { slug } = await params;
  let heroPageData = null;

  try {
    heroPageData = await getHeroPageData(slug);
  } catch (error) {
    return (
      <main>
        <PageContainer className="space-y-5 py-8 sm:space-y-6 sm:py-10">
          <StateMessage
            title="Unable to load hero detail"
            description={getErrorMessage(error)}
            tone="error"
          />
        </PageContainer>
      </main>
    );
  }

  if (!heroPageData) {
    notFound();
  }

  const { overview } = heroPageData;
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(heroPageData.generatedAt));

  return (
    <main>
      <PageContainer className="space-y-6 py-8 sm:space-y-7 sm:py-10">
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

        <section
          className="relative overflow-hidden rounded-[28px] bg-card-surface p-5 sm:p-6 lg:p-7"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          {overview.painting ? (
            <div className="absolute inset-0 opacity-20">
              <Image
                src={overview.painting}
                alt={overview.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-r from-page-background via-page-background/94 to-page-background/72" />

          <div className="relative grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[24px] bg-card-surface-strong xl:mx-0 xl:max-w-none">
              <div className="absolute left-3 top-3 z-10">
                <TierBadge tier={overview.tier} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-[32px] font-medium tracking-[0.08em] text-text-secondary">
                {getHeroInitials(overview.name)}
              </div>
              {overview.portrait ? (
                <Image
                  src={overview.portrait}
                  alt={overview.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 260px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <RoleBadge role={overview.primaryRole} />
                  {overview.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-card-surface px-2.5 py-1 text-[11px] text-text-secondary"
                      style={{ border: "0.5px solid var(--border-subtle)" }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div>
                  <h1 className="text-[32px] font-medium tracking-[-0.04em] text-text-primary sm:text-[40px]">
                    {overview.name}
                  </h1>
                  <p className="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary sm:text-[15px]">
                    {overview.story ||
                      `${overview.name} is currently tier ${overview.tier} with live MLBB performance tracking for builds, counters, teammates, and recent trend movement.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <div
                  className="rounded-xl bg-page-background/70 p-3.5 sm:p-4"
                  style={{ border: "0.5px solid var(--border-subtle)" }}
                >
                  <div className="text-[11px] text-text-muted">Win rate</div>
                  <div className="mt-2 text-[18px] font-medium text-success-soft">
                    {overview.winRate.toFixed(1)}%
                  </div>
                </div>
                <div
                  className="rounded-xl bg-page-background/70 p-3.5 sm:p-4"
                  style={{ border: "0.5px solid var(--border-subtle)" }}
                >
                  <div className="text-[11px] text-text-muted">Pick rate</div>
                  <div className="mt-2 text-[18px] font-medium text-accent-text">
                    {overview.pickRate.toFixed(1)}%
                  </div>
                </div>
                <div
                  className="rounded-xl bg-page-background/70 p-3.5 sm:p-4"
                  style={{ border: "0.5px solid var(--border-subtle)" }}
                >
                  <div className="text-[11px] text-text-muted">Ban rate</div>
                  <div className="mt-2 text-[18px] font-medium text-warning-soft">
                    {overview.banRate.toFixed(1)}%
                  </div>
                </div>
                <div
                  className="rounded-xl bg-page-background/70 p-3.5 sm:p-4"
                  style={{ border: "0.5px solid var(--border-subtle)" }}
                >
                  <div className="text-[11px] text-text-muted">Difficulty</div>
                  <div className="mt-2 text-[18px] font-medium text-text-primary">
                    {overview.difficulty.toFixed(0)}/100
                  </div>
                </div>
              </div>

              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)]">
                <div
                  className="rounded-xl bg-page-background/70 p-4"
                  style={{ border: "0.5px solid var(--border-subtle)" }}
                >
                  <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
                    Draft snapshot
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-[11px] text-text-muted">Roles</div>
                      <div className="mt-2 text-[13px] font-medium text-text-primary">
                        {overview.roles.join(", ")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">Lanes</div>
                      <div className="mt-2 text-[13px] font-medium uppercase text-text-primary">
                        {overview.lanes.length ? overview.lanes.join(", ") : "TBD"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-muted">Skill priority</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {overview.skillPriority.length > 0 ? (
                          overview.skillPriority.map((value) => (
                            <span
                              key={value}
                              className="rounded-full bg-card-surface px-2.5 py-1 text-[11px] text-text-secondary"
                              style={{ border: "0.5px solid var(--border-subtle)" }}
                            >
                              Skill {value}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-text-muted">Not available</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl bg-page-background/70 p-4"
                  style={{ border: "0.5px solid var(--border-subtle)" }}
                >
                  <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
                    Data freshness
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="text-[13px] font-medium text-text-primary">
                      Last sync {generatedAt}
                    </div>
                    <p className="text-[12px] leading-6 text-text-secondary">
                      {heroPageData.stale
                        ? "Some optional hero modules are temporarily using fallback data while upstream endpoints recover."
                        : "All hero detail modules were assembled from the latest upstream MLBB hero endpoints."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="min-w-0 space-y-5">
            <section
              className="space-y-4 rounded-2xl bg-card-surface p-4 sm:p-5"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Overview</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                  A quick read on the hero profile, specialties, and at-a-glance attribute spread.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {overview.attributes.map((attribute) => (
                  <div
                    key={attribute.label}
                    className="space-y-2 rounded-xl bg-page-background/70 p-4"
                    style={{ border: "0.5px solid var(--border-subtle)" }}
                  >
                    <div className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="text-text-secondary">{attribute.label}</span>
                      <span className="font-medium text-text-primary">
                        {attribute.value.toFixed(0)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-card-surface">
                      <div
                        className="h-full rounded-full bg-accent-primary"
                        style={{ width: `${attribute.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl bg-page-background/70 p-4"
                style={{ border: "0.5px solid var(--border-subtle)" }}
              >
                <div className="text-[11px] font-medium tracking-[0.16em] text-text-muted uppercase">
                  Role identity
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {overview.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
                {overview.specialties.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                    {overview.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-card-surface px-3 py-1.5 text-text-secondary"
                        style={{ border: "0.5px solid var(--border-subtle)" }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Build plans</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                  Recommended item paths, emblem setups, and battle spell suggestions when the upstream MLBB feeds expose structured build-plan data.
                </p>
              </div>

              {heroPageData.builds.length > 0 ? (
                heroPageData.builds.map((plan) => (
                  <HeroBuildPlanCard key={`${plan.title}-${plan.creatorName ?? "plan"}`} plan={plan} />
                ))
              ) : (
                <StateMessage
                  title="No published build plan yet"
                  description="The current hero detail feed is not returning a structured recommended build for this hero, and the legacy academy lane route is also not exposing a usable build payload right now."
                  tone="muted"
                />
              )}
            </section>

            <section
              className="space-y-4 rounded-2xl bg-card-surface p-5"
              style={{ border: "0.5px solid var(--border-subtle)" }}
            >
              <div>
                <h2 className="text-[18px] font-medium text-text-primary">Skill combos</h2>
                <p className="mt-1 text-[12px] leading-6 text-text-secondary">
                  Rotation notes and combo patterns taken from the hero’s skill-combo feed.
                </p>
              </div>

              {heroPageData.combos.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {heroPageData.combos.map((combo, comboIndex) => (
                    <article
                      key={`${combo.title}-${comboIndex}`}
                      className="space-y-3 rounded-xl bg-page-background/70 p-4"
                      style={{ border: "0.5px solid var(--border-subtle)" }}
                    >
                      <div>
                        <div className="text-[13px] font-medium text-text-primary">{combo.title}</div>
                        {combo.description ? (
                          <p className="mt-2 text-[12px] leading-6 text-text-secondary">
                            {combo.description}
                          </p>
                        ) : null}
                      </div>
                      {combo.icons.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {combo.icons.map((icon, iconIndex) => (
                            <div
                              key={`${combo.title}-${icon.skillId}-${iconIndex}`}
                              className="relative size-11 overflow-hidden rounded-xl bg-card-surface-strong"
                            >
                              {icon.icon ? (
                                <Image
                                  src={icon.icon}
                                  alt={`Skill ${icon.skillId}`}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <StateMessage
                  title="No combo sheet published yet"
                  description="The skill-combo endpoint has not exposed combo copy for this hero yet."
                  tone="muted"
                />
              )}
            </section>

            <HeroDetailExplorer slug={overview.slug} initialData={heroPageData} />
          </div>

          <div className="space-y-5 self-start">
            <HeroMatchupList
              title="They counter"
              description="Opponents where this hero gains the strongest positive win-rate swing in the selected counters feed."
              emptyTitle="No matchup edges yet"
              emptyDescription="The counters endpoint did not return structured matchup rows for this hero and rank filter."
              items={heroPageData.counters}
            />

            <HeroMatchupList
              title="Best teammates"
              description="Pairings that create the strongest positive win-rate swing in the selected compatibility feed."
              emptyTitle="No teammate data yet"
              emptyDescription="The compatibility endpoint did not return structured teammate rows for this hero and rank filter."
              items={heroPageData.teammates}
            />
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
