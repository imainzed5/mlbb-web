import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Crown,
  Flame,
  Shield,
  UserRound,
} from "lucide-react";

import { HeroAvatarImage } from "@/components/heroes/HeroAvatarImage";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHeroFeatureVisual } from "@/lib/heroes/getHeroFeatureVisual";
import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";
import type { HeroBrowserItem, HeroBrowserPayload } from "@/lib/heroes/types";
import { createWebSiteJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

const primaryRoutes = [
  {
    href: "/heroes",
    label: "Hero browser",
    description: "Scan every hero by role, tier, and win rate.",
    icon: Shield,
  },
  {
    href: "/heroes/rank",
    label: "Rank board",
    description: "See tier placement and strongest ranked picks.",
    icon: Crown,
  },
  {
    href: "/meta",
    label: "Meta tracker",
    description: "Compare win, pick, and ban pressure.",
    icon: BarChart3,
  },
];

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-page-background";

type DataStatusTone = "live" | "partial" | "snapshot";

type DataStatus = {
  label: string;
  detail: string;
  tone: DataStatusTone;
};

type MetaPulseItem = {
  label: string;
  hero: HeroBrowserItem | null;
  value: string;
};

const dataStatusToneClasses: Record<DataStatusTone, string> = {
  live: "border-success-soft/30 bg-success-soft/10 text-success-soft",
  partial: "border-warning-soft/30 bg-warning-soft/10 text-warning-soft",
  snapshot: "border-border-subtle bg-card-surface/70 text-text-secondary",
};

export const metadata = createPageMetadata({
  title: "mlbbstats",
  description:
    "Browse MLBB heroes, open detailed builds and matchup notes, and track the evolving rank board from a fast Mobile Legends dashboard.",
  path: "/",
});

function formatStatusDate(value: string | null) {
  if (!value) {
    return "date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getDataStatus(payload: HeroBrowserPayload): DataStatus {
  if (payload.source === "snapshot") {
    return {
      label: "Saved snapshot",
      detail: "Captured " + formatStatusDate(payload.snapshotAt),
      tone: "snapshot",
    };
  }

  if (payload.source === "partial") {
    return {
      label: "Partial data",
      detail: "Some feeds unavailable · synced " + formatStatusDate(payload.generatedAt),
      tone: "partial",
    };
  }

  return {
    label: "Live data",
    detail: "Synced " + formatStatusDate(payload.generatedAt),
    tone: "live",
  };
}

function getHeroInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function sortHeroesForHomepage(heroes: HeroBrowserItem[]) {
  return [...heroes].sort((heroA, heroB) => {
    if (heroA.tierOrder !== heroB.tierOrder) {
      return heroA.tierOrder - heroB.tierOrder;
    }
    if (heroA.winRate !== heroB.winRate) {
      return heroB.winRate - heroA.winRate;
    }
    if (heroA.pickRate !== heroB.pickRate) {
      return heroB.pickRate - heroA.pickRate;
    }
    return heroA.name.localeCompare(heroB.name);
  });
}

function formatPercentage(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value.toFixed(1) + "%"
    : "—";
}

function findBestHero(
  heroes: HeroBrowserItem[],
  metric: "winRate" | "pickRate" | "banRate"
) {
  return heroes.reduce<HeroBrowserItem | null>((bestHero, hero) => {
    if (!bestHero || hero[metric] > bestHero[metric]) {
      return hero;
    }

    return bestHero;
  }, null);
}

function getMetaPulseItems(heroes: HeroBrowserItem[]): MetaPulseItem[] {
  const bestWinRateHero = findBestHero(heroes, "winRate");
  const mostPickedHero = findBestHero(heroes, "pickRate");
  const mostBannedHero = findBestHero(heroes, "banRate");

  return [
    {
      label: "Best win rate",
      hero: bestWinRateHero,
      value: formatPercentage(bestWinRateHero?.winRate),
    },
    {
      label: "Most picked",
      hero: mostPickedHero,
      value: formatPercentage(mostPickedHero?.pickRate),
    },
    {
      label: "Most banned",
      hero: mostBannedHero,
      value: formatPercentage(mostBannedHero?.banRate),
    },
  ];
}

function SectionHeading({
  eyebrow,
  title,
  href,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  icon: typeof Shield;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle pb-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-surface/70 text-accent-text">
          <Icon className="size-4" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-text-muted uppercase">{eyebrow}</p>
          <h2 className="mt-0.5 truncate text-[18px] font-medium tracking-[-0.03em] text-text-primary sm:text-[20px]">
            {title}
          </h2>
        </div>
      </div>
      {href ? (
        <Link
          href={href}
          className={"inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-accent-text hover:text-text-primary " + focusRingClass}
        >
          Open board
          <ArrowUpRight className="size-4" strokeWidth={2} />
        </Link>
      ) : null}
    </div>
  );
}

function HeroStats({ hero }: { hero: HeroBrowserItem }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "WR", value: formatPercentage(hero.winRate) },
        { label: "PR", value: formatPercentage(hero.pickRate) },
        { label: "BR", value: formatPercentage(hero.banRate) },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border-subtle bg-page-background/45 px-3 py-2.5">
          <div className="text-[10px] font-semibold tracking-[0.16em] text-text-muted uppercase">{stat.label}</div>
          <div className="mt-1 text-[16px] font-medium text-text-primary">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

function FeaturedHero({
  hero,
  featureVisual,
  dataStatus,
}: {
  hero: HeroBrowserItem | null;
  featureVisual: Awaited<ReturnType<typeof getHeroFeatureVisual>> | null;
  dataStatus: DataStatus;
}) {
  const primaryImage = featureVisual?.primarySrc ?? hero?.image ?? null;
  const fallbackImage = featureVisual?.fallbackSrc ?? hero?.smallmap ?? null;

  return (
    <section className="overflow-hidden rounded-[28px] border border-border-subtle bg-[#121a29] shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
      {hero ? (
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
          <div className="relative flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute -left-24 top-10 size-64 rounded-full bg-accent-primary/10 blur-3xl" />
            <div className="absolute bottom-[-100px] right-[-80px] size-72 rounded-full bg-[#18345c]/25 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-surface/50 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-accent-text uppercase">
                  <Flame className="size-3.5" strokeWidth={2} />
                  Featured signal
                </span>
                <span className="rounded-full border border-tier-s/30 bg-tier-s/10 px-2.5 py-1 text-[10px] font-semibold text-tier-s">
                  Tier {hero.tier}
                </span>
              </div>

              <p className="mt-8 text-[11px] font-medium tracking-[0.25em] text-text-muted uppercase">Current board leader</p>
              <h2 className="mt-3 text-[42px] font-medium leading-none tracking-[-0.07em] text-text-primary sm:text-[58px]">
                {hero.name}
              </h2>
              <p className="mt-3 text-[14px] text-text-secondary">
                {hero.primaryRole} signal · {hero.tier}-tier priority pick
              </p>
              <p className="mt-4 max-w-md text-[14px] leading-6 text-text-secondary">
                A strong place to start your next draft. Open the full hero page for matchup context and build notes.
              </p>

              <div className="mt-6">
                <HeroStats hero={hero} />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/heroes/${hero.slug}`}
                  className={"inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent-primary bg-accent-surface px-4 text-[12px] font-semibold tracking-[0.12em] text-accent-text uppercase transition-colors hover:bg-[#21456f] " + focusRingClass}
                >
                  Open hero
                  <ArrowRight className="size-4" strokeWidth={2} />
                </Link>
                <Link
                  href="/heroes/rank"
                  className={"inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card-surface/60 px-4 text-[12px] font-semibold tracking-[0.12em] text-text-primary uppercase transition-colors hover:border-accent-primary hover:text-accent-text " + focusRingClass}
                >
                  View rank board
                  <ArrowUpRight className="size-4" strokeWidth={2} />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
                <span className={"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium " + dataStatusToneClasses[dataStatus.tone]}>
                  <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                  {dataStatus.label}
                </span>
                <span className="text-text-muted" aria-hidden="true">·</span>
                <span>{dataStatus.detail}</span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden border-t border-border-subtle bg-[#0d1421] lg:min-h-[430px] lg:border-t-0 lg:border-l">
            <div className="absolute -inset-6 scale-110 opacity-25 blur-3xl">
              <HeroAvatarImage
                primarySrc={primaryImage}
                fallbackSrc={fallbackImage}
                alt=""
                sizes="60vw"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-5xl font-medium tracking-[0.12em] text-text-secondary/70">
              {getHeroInitials(hero.name)}
            </div>
            <div className="absolute inset-0 scale-105">
              <HeroAvatarImage
                primarySrc={primaryImage}
                fallbackSrc={fallbackImage}
                alt={`${hero.name} hero artwork`}
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[50%_42%]"
                preload
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#0d1421_0%,rgba(13,20,33,0.72)_28%,rgba(13,20,33,0.18)_68%,rgba(13,20,33,0.08)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,20,33,0.08)_0%,rgba(13,20,33,0.12)_52%,#0d1421_100%)]" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between gap-8 p-6 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-accent-text uppercase">MLBB scouting desk</p>
            <h2 className="mt-4 max-w-xl text-[40px] font-medium leading-[0.98] tracking-[-0.07em] text-text-primary sm:text-[56px]">
              Read the field. Draft smarter. Win more.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-text-secondary">
              Hero signals are unavailable right now, but the public tools are ready when the board returns.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0 lg:flex-col">
            <Link
              href="/heroes"
              className={"inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent-primary bg-accent-surface px-4 text-[12px] font-semibold tracking-[0.12em] text-accent-text uppercase " + focusRingClass}
            >
              Explore heroes
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
            <Link
              href="/meta"
              className={"inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-subtle bg-card-surface/60 px-4 text-[12px] font-semibold tracking-[0.12em] text-text-primary uppercase " + focusRingClass}
            >
              View the meta
              <ArrowUpRight className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function TopTierPicks({ heroes }: { heroes: HeroBrowserItem[] }) {
  return (
    <section className="rounded-[24px] border border-border-subtle bg-[#141c2b] p-4 sm:p-5">
      <SectionHeading eyebrow="Rank board" title="Top tier picks" href="/heroes/rank" icon={Crown} />

      <div className="mt-4 space-y-2.5">
        {heroes.length > 0 ? (
          heroes.map((hero, index) => {
            const isFeatured = index === 0;

            return (
              <Link
                key={hero.heroId}
                href={`/heroes/${hero.slug}`}
                className={
                  "group flex items-center gap-3 rounded-2xl border transition-colors hover:border-accent-primary " +
                  focusRingClass +
                  " " +
                  (isFeatured
                    ? "border-accent-primary/50 bg-accent-surface/20 px-4 py-4"
                    : "border-border-subtle bg-page-background/35 px-3 py-3")
                }
              >
                <div
                  className={
                    "flex shrink-0 items-center justify-center rounded-full font-medium " +
                    (isFeatured
                      ? "size-9 bg-accent-surface text-[12px] text-accent-text"
                      : "size-8 bg-card-surface text-[11px] text-text-secondary")
                  }
                >
                  {index + 1}
                </div>
                <div className={"relative shrink-0 overflow-hidden rounded-2xl bg-card-surface-strong " + (isFeatured ? "size-14" : "size-11")}>
                  <div className="absolute inset-0 flex items-center justify-center text-[13px] font-medium tracking-[0.08em] text-text-secondary">
                    {getHeroInitials(hero.name)}
                  </div>
                  <HeroAvatarImage
                    primarySrc={hero.image}
                    fallbackSrc={hero.smallmap}
                    alt={hero.name}
                    sizes={isFeatured ? "56px" : "44px"}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-[14px] font-medium text-text-primary group-hover:text-accent-text">{hero.name}</div>
                    <span className="rounded-full border border-border-subtle bg-card-surface px-2 py-0.5 text-[10px] font-semibold text-accent-text">
                      {hero.tier}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-secondary">
                    <span>WR {formatPercentage(hero.winRate)}</span>
                    <span>PR {formatPercentage(hero.pickRate)}</span>
                    <span>BR {formatPercentage(hero.banRate)}</span>
                  </div>
                </div>
                <ArrowUpRight
                  className="size-4 shrink-0 text-text-muted opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text group-hover:opacity-100"
                  strokeWidth={2}
                />
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl border border-border-subtle bg-page-background/35 px-4 py-4 text-[12px] leading-6 text-text-secondary">
            No ranked signals are available right now. {" "}
            <Link href="/heroes/rank" className={"font-medium text-accent-text underline-offset-4 hover:underline " + focusRingClass}>
              Open the rank board
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function MetaPulse({ items }: { items: MetaPulseItem[] }) {
  return (
    <section className="rounded-[24px] border border-border-subtle bg-[#141c2b] p-4 sm:p-5">
      <SectionHeading eyebrow="Meta signals" title="Meta pulse" icon={BarChart3} />

      <div className="mt-4 space-y-2.5">
        {items.map((item) => {
          const content = (
            <>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-text-muted uppercase">{item.label}</div>
                <div className="mt-1 truncate text-[14px] font-medium text-text-primary group-hover:text-accent-text">
                  {item.hero?.name ?? "No signal"}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[16px] font-medium text-accent-text">{item.value}</span>
                <ArrowUpRight className="size-4 text-text-muted opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text group-hover:opacity-100" strokeWidth={2} />
              </div>
            </>
          );

          if (!item.hero) {
            return (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-page-background/35 px-3 py-3">
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={`/heroes/${item.hero.slug}`}
              className={"group flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-page-background/35 px-3 py-3 transition-colors hover:border-accent-primary " + focusRingClass}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ExploreTools() {
  return (
    <section className="rounded-[24px] border border-border-subtle bg-[#121a29] p-4 sm:p-5">
      <SectionHeading eyebrow="Public tools" title="Explore mlbbstats" icon={Flame} />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {primaryRoutes.map((route) => {
          const Icon = route.icon;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={"group rounded-2xl border border-border-subtle bg-page-background/35 p-4 transition-colors hover:border-accent-primary hover:bg-accent-surface/10 " + focusRingClass}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent-surface/70 text-accent-text">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <ArrowUpRight className="size-4 text-text-muted opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-text group-hover:opacity-100" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-[16px] font-medium text-text-primary group-hover:text-accent-text">{route.label}</h3>
              <p className="mt-2 text-[12px] leading-6 text-text-secondary">{route.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AccountCta() {
  return (
    <Link
      href="/player"
      className={"group flex min-h-full items-center gap-4 rounded-[24px] border border-border-subtle bg-[linear-gradient(135deg,#172945_0%,#121a29_70%)] p-5 transition-colors hover:border-accent-primary sm:p-6 " + focusRingClass}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-surface text-accent-text">
        <UserRound className="size-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-accent-text uppercase">Private dashboard</p>
        <h2 className="mt-1 text-[18px] font-medium tracking-[-0.03em] text-text-primary">Connect your MLBB account</h2>
        <p className="mt-2 text-[12px] leading-6 text-text-secondary">
          Unlock a private dashboard with your own match history and performance data.
        </p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text" strokeWidth={2} />
    </Link>
  );
}

function BoardGuide() {
  return (
    <section className="rounded-[24px] border border-border-subtle bg-[#141c2b] p-5 sm:p-6">
      <SectionHeading eyebrow="Quick guide" title="How to read the board" icon={BookOpen} />
      <dl className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {[
          { label: "WR", text: "Win rate — percentage of matches won.", color: "text-success-soft" },
          { label: "PR", text: "Pick rate — how often a hero is selected.", color: "text-accent-text" },
          { label: "BR", text: "Ban rate — how often a hero is removed.", color: "text-warning-soft" },
        ].map((item) => (
          <div key={item.label} className="flex gap-3 rounded-xl border border-border-subtle bg-page-background/35 px-3 py-3">
            <dt className={"w-8 shrink-0 text-[11px] font-semibold " + item.color}>{item.label}</dt>
            <dd className="text-[12px] leading-5 text-text-secondary">{item.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function Home() {
  const heroBrowserData = await getHeroBrowserData();
  const sortedHeroes = sortHeroesForHomepage(heroBrowserData.heroes);
  const topTierHeroes = sortedHeroes.slice(0, 5);
  const featuredHero = topTierHeroes[0] ?? null;
  const featureVisual = featuredHero
    ? await getHeroFeatureVisual(featuredHero.heroId)
    : null;
  const sTierCount = heroBrowserData.heroes.filter((hero) => hero.tier === "S").length;
  const dataStatus = getDataStatus(heroBrowserData);
  const metaPulseItems = getMetaPulseItems(heroBrowserData.heroes);

  return (
    <main className="relative isolate overflow-hidden pb-24 sm:pb-8">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(55, 138, 221, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(55, 138, 221, 0.08) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          }}
        />
        <div className="absolute -left-48 top-12 size-[34rem] rounded-full bg-accent-primary/[0.045] blur-3xl" />
        <div className="absolute -right-48 top-[34rem] size-[30rem] rounded-full bg-[#2b5784]/[0.04] blur-3xl" />
      </div>
      <PageContainer className="py-5 sm:py-8">
        <JsonLd data={createWebSiteJsonLd()} />

        <div className="space-y-5">
          <header className="px-1">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.24em] text-accent-text uppercase">Mobile Legends scouting portal</p>
              <h1 className="mt-3 max-w-3xl text-[32px] font-medium leading-[1.02] tracking-[-0.06em] text-text-primary sm:text-[44px]">
                Read the field. <span className="text-accent-text">Draft smarter.</span> Win more.
              </h1>
              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-text-secondary sm:text-[15px]">
                Live hero tiers, matchup pressure, and rank signals to help you make your next pick with confidence.
              </p>
            </div>
          </header>

          <FeaturedHero hero={featuredHero} featureVisual={featureVisual} dataStatus={dataStatus} />

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,0.8fr)]">
            <TopTierPicks heroes={topTierHeroes} />
            <MetaPulse items={metaPulseItems} />
          </div>

          <ExploreTools />

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
            <AccountCta />
            <BoardGuide />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-card-surface/45 px-4 py-3">
              <div className="text-[10px] font-semibold tracking-[0.18em] text-text-muted uppercase">Heroes tracked</div>
              <div className="mt-1 text-[22px] font-medium tracking-[-0.04em] text-text-primary">{heroBrowserData.summary.totalHeroes}</div>
              <p className="mt-1 text-[11px] text-text-secondary">Roster data available to explore.</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-card-surface/45 px-4 py-3">
              <div className="text-[10px] font-semibold tracking-[0.18em] text-text-muted uppercase">S-tier picks</div>
              <div className="mt-1 text-[22px] font-medium tracking-[-0.04em] text-text-primary">{sTierCount > 0 ? sTierCount : "—"}</div>
              <p className="mt-1 text-[11px] text-text-secondary">Highest tier on the current board.</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
