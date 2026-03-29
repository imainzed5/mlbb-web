import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Crown,
  Flame,
  Shield,
  UserRound,
} from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";
import type { HeroBrowserItem } from "@/lib/heroes/types";
import { createWebSiteJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";

const primaryRoutes = [
  {
    href: "/heroes",
    label: "Hero browser",
    description: "Scan the full roster with tighter role filters, cleaner cards, and faster browsing.",
    icon: Shield,
  },
  {
    href: "/heroes/rank",
    label: "Rank board",
    description: "Track tier movement, priority bans, and strongest picks in one sharper board.",
    icon: Crown,
  },
  {
    href: "/meta",
    label: "Meta tracker",
    description: "Compare lane pressure, contest rate, and draft priority at a glance.",
    icon: BarChart3,
  },
];

const signalCards = [
  {
    label: "Hero count",
    value: "132",
    note: "Heroes mapped into one scouting layer",
    icon: Shield,
  },
  {
    label: "Tier list",
    value: "S-A",
    note: "Fast power sorting for ranked and draft prep",
    icon: Crown,
  },
];

export const metadata = createPageMetadata({
  title: "mlbbstats",
  description:
    "Browse MLBB heroes, open detailed builds and matchup notes, and track the evolving rank board from a fast Mobile Legends dashboard.",
  path: "/",
});

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

export default async function Home() {
  const heroBrowserData = await getHeroBrowserData();
  const topRankHeroes = sortHeroesForHomepage(heroBrowserData.heroes).slice(0, 5);

  return (
    <main>
      <PageContainer className="py-5 sm:py-6">
        <JsonLd data={createWebSiteJsonLd()} />

        <section className="overflow-hidden rounded-[30px] border border-border-subtle bg-[#0d1118] shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="grid min-h-[calc(100vh-7.5rem)] xl:grid-cols-[minmax(0,0.98fr)_minmax(420px,0.82fr)]">
            <div className="relative overflow-hidden border-b border-border-subtle p-6 sm:p-8 lg:p-10 xl:border-b-0 xl:border-r">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-primary/70 to-transparent" />
              <div className="absolute -left-24 top-16 size-64 rounded-full bg-accent-primary/10 blur-3xl" />
              <div className="absolute bottom-[-80px] right-[-50px] size-72 rounded-full bg-[#18345c]/22 blur-3xl" />

              <div className="relative flex h-full flex-col">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-surface/50 px-3 py-1 text-[10px] font-semibold tracking-[0.24em] text-accent-text uppercase">
                  <Flame className="size-3.5" strokeWidth={2} />
                  Draft room signal
                </div>

                <div className="mt-8 max-w-[34rem]">
                  <p className="text-[11px] font-medium tracking-[0.28em] text-text-muted uppercase">
                    Mobile Legends portal
                  </p>
                  <h1 className="mt-4 text-[40px] font-medium leading-[0.96] tracking-[-0.07em] text-text-primary sm:text-[54px] lg:text-[68px]">
                    Read the field.
                    <br />
                    <span className="text-accent-text">Draft smarter.</span>
                    <br />
                    Win more.
                  </h1>
                  <p className="mt-5 max-w-xl text-[15px] leading-7 text-text-secondary sm:text-[16px]">
                    Your fast read for hero value, rank movement, and matchup pressure. Built to feel like a live scouting desk.
                  </p>
                </div>

                <div className="mt-8 max-w-xl rounded-[24px] border border-border-subtle bg-[#111726]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="text-[10px] font-semibold tracking-[0.22em] text-text-muted uppercase">
                    Account connect
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)_auto]">
                    <div className="min-h-12 rounded-xl border border-border-subtle bg-page-background/80 px-4 py-3">
                      <div className="text-[10px] font-medium tracking-[0.14em] text-text-muted uppercase">
                        Role ID
                      </div>
                      <div className="mt-1 text-[13px] text-text-secondary">Your in-game account ID</div>
                    </div>
                    <div className="min-h-12 rounded-xl border border-border-subtle bg-page-background/80 px-4 py-3">
                      <div className="text-[10px] font-medium tracking-[0.14em] text-text-muted uppercase">
                        Zone ID
                      </div>
                      <div className="mt-1 text-[13px] text-text-secondary">Your server / zone number</div>
                    </div>
                    <Link
                      href="/player"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-accent-primary bg-accent-surface px-5 text-[12px] font-semibold tracking-[0.14em] text-accent-text uppercase transition-colors hover:bg-[#21456f]"
                    >
                      Connect
                      <ArrowRight className="size-4" strokeWidth={2} />
                    </Link>
                  </div>
                  <p className="mt-3 text-[12px] leading-6 text-text-secondary">
                    Verification is done with a 4-digit code sent to MLBB in-game mail before the private dashboard opens.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/meta"
                      className="rounded-full border border-accent-primary/30 bg-accent-surface/45 px-3 py-1.5 text-[11px] font-medium text-accent-text transition-colors hover:border-accent-primary"
                    >
                      Meta
                    </Link>
                    <Link
                      href="/heroes"
                      className="rounded-full border border-border-subtle bg-page-background/70 px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:text-text-primary"
                    >
                      Heroes
                    </Link>
                    <Link
                      href="/heroes/rank"
                      className="rounded-full border border-border-subtle bg-page-background/70 px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:text-text-primary"
                    >
                      Rank board
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {signalCards.map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.label}
                        className="rounded-[22px] border border-border-subtle bg-[#111726]/82 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] tracking-[0.18em] text-text-muted uppercase">
                            {item.label}
                          </span>
                          <Icon className="size-4 text-accent-text" strokeWidth={2} />
                        </div>
                        <div className="mt-4 text-[28px] font-medium tracking-[-0.05em] text-text-primary">
                          {item.value}
                        </div>
                        <p className="mt-2 text-[12px] leading-5 text-text-secondary">{item.note}</p>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-auto pt-8">
                  <div className="grid gap-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      {primaryRoutes.map((card) => {
                        const Icon = card.icon;

                        return (
                          <Link
                            key={card.href}
                            href={card.href}
                            className="group rounded-[24px] border border-border-subtle bg-[#101522]/82 p-4 transition-colors hover:border-accent-primary"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex size-11 items-center justify-center rounded-2xl bg-accent-surface/60 text-accent-text">
                                <Icon className="size-5" strokeWidth={2} />
                              </div>
                              <ArrowUpRight
                                className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                strokeWidth={2}
                              />
                            </div>
                            <div className="mt-5 text-[16px] font-medium text-text-primary">{card.label}</div>
                            <p className="mt-2 max-w-[28ch] text-[12px] leading-6 text-text-secondary">
                              {card.description}
                            </p>
                          </Link>
                        );
                      })}
                    </div>

                    <Link
                      href="/player"
                      className="rounded-[24px] border border-border-subtle bg-[#101522]/72 p-4 transition-colors hover:border-accent-primary"
                    >
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-page-background/80 text-text-secondary">
                        <UserRound className="size-4.5" strokeWidth={2} />
                      </div>
                      <div className="mt-4 text-[14px] font-medium text-text-primary">Account connect</div>
                      <p className="mt-2 text-[12px] leading-6 text-text-secondary">
                        Connect your own MLBB account with verification to open a private dashboard on this device.
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,#121827_0%,#151b2c_100%)] p-4 sm:p-6 lg:p-7">
              <div className="grid gap-4">
                <section className="rounded-[24px] border border-border-subtle bg-[#151b2a] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-text-muted uppercase">
                        Rank pressure
                      </p>
                      <h2 className="mt-2 text-[20px] font-medium tracking-[-0.04em] text-text-primary">
                        High-value heroes this cycle
                      </h2>
                    </div>
                    <Link
                      href="/heroes/rank"
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-accent-text"
                    >
                      Open board
                      <ArrowUpRight className="size-4" strokeWidth={2} />
                    </Link>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {topRankHeroes.map((hero, index) => (
                      <Link
                        key={hero.heroId}
                        href={`/heroes/${hero.slug}`}
                        className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-page-background/40 px-3 py-3 transition-colors hover:border-accent-primary"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card-surface text-[11px] font-medium text-text-secondary">
                          {index + 1}
                        </div>
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-card-surface-strong">
                          <div className="absolute inset-0 flex items-center justify-center text-[13px] font-medium tracking-[0.08em] text-text-secondary">
                            {getHeroInitials(hero.name)}
                          </div>
                          {hero.image ? (
                            <Image
                              src={hero.image}
                              alt={hero.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-[14px] font-medium text-text-primary">
                              {hero.name}
                            </div>
                            <span className="rounded-full border border-border-subtle bg-card-surface px-2 py-0.5 text-[10px] font-semibold text-accent-text">
                              {hero.tier}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-secondary">
                            <span>WR {hero.winRate.toFixed(1)}%</span>
                            <span>PR {hero.pickRate.toFixed(1)}%</span>
                            <span>BR {hero.banRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                <section>
                  <article className="rounded-[24px] border border-border-subtle bg-[#151b2a] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold tracking-[0.2em] text-text-muted uppercase">
                        Main routes
                      </p>
                      <ArrowUpRight className="size-4 text-accent-text" strokeWidth={2} />
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {primaryRoutes.map((card) => (
                        <Link
                          key={card.href}
                          href={card.href}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-page-background/35 px-3 py-3 transition-colors hover:border-accent-primary"
                        >
                          <span className="text-[13px] font-medium text-text-primary">{card.label}</span>
                          <ArrowUpRight className="size-4 text-text-muted" strokeWidth={2} />
                        </Link>
                      ))}
                    </div>
                  </article>
                </section>
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
