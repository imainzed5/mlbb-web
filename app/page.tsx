import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, BookOpen, Calculator, Trophy, UserRound } from "lucide-react";

import { HeroAvatarImage } from "@/components/heroes/HeroAvatarImage";
import { DeltaValue, WinRateValue } from "@/components/heroes/StatCells";
import { TierBadge } from "@/components/heroes/TierBadge";
import { HeroSearch } from "@/components/layout/HeroSearch";
import { PageContainer } from "@/components/layout/PageContainer";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPublicTimestamp } from "@/lib/date-time";
import { getLeagueData, type League, type ScheduledMatch } from "@/lib/esports/data";
import { ROLE_DOT } from "@/lib/heroes/constants";
import { getHeroTierList } from "@/lib/heroes/getHeroTierList";
import type { HeroTierListItem } from "@/lib/heroes/types";
import { createWebSiteJsonLd } from "@/lib/seo/jsonld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const metadata = createPageMetadata({
  title: "mlbbstats",
  description:
    "MLBB hero tier list, builds, counters and meta trends, plus MPL PH and ID esports results, in one fast Mobile Legends stats site.",
  path: "/",
});

const tiles = [
  { href: "/tools/win-rate", label: "Win-rate calculator", text: "Wins needed to reach your target WR", icon: Calculator },
  { href: "/esports", label: "Playoff simulator", text: "Run MPL standings scenarios", icon: Trophy },
  { href: "/academy", label: "Academy", text: "Items, emblems, spells and talents", icon: BookOpen },
  { href: "/player", label: "Connect account", text: "Your private player dashboard", icon: UserRound },
];

function HeroRow({ hero, rank, className, children }: { hero: HeroTierListItem; rank?: number; className?: string; children: React.ReactNode }) {
  return (
    <li className={cn("border-b border-border-subtle last:border-b-0", className)}>
      <Link href={`/heroes/${hero.slug}`} className="group flex items-center gap-2.5 py-1.5">
        {rank ? <span className="num w-4 text-[12px] text-text-muted">{rank}</span> : null}
        {rank ? <TierBadge tier={hero.tier} /> : null}
        <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-surface-raised">
          <HeroAvatarImage primarySrc={hero.image} fallbackSrc={hero.smallmap} alt="" sizes="32px" />
        </span>
        <span className="min-w-0 flex-1 truncate">
          <span className="text-[13px] font-semibold group-hover:text-accent-text">{hero.name}</span>
          <span className="ml-2 text-[11.5px]" style={{ color: ROLE_DOT[hero.primaryRole] }}>
            {hero.primaryRole}
          </span>
        </span>
        {children}
      </Link>
    </li>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border-subtle bg-card-surface p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function pickMatches(league: League, schedule: ScheduledMatch[] | null) {
  if (!schedule) return [];
  const now = Date.now();
  const timed = schedule.filter((match) => match.start).sort((a, b) => Date.parse(a.start!) - Date.parse(b.start!));
  const played = timed.filter((match) => match.score1 !== null && match.score2 !== null && Date.parse(match.start!) <= now).slice(-1);
  const upcoming = timed.filter((match) => Date.parse(match.start!) > now).slice(0, 1);
  return [...played.map((match) => ({ league, match, played: true })), ...upcoming.map((match) => ({ league, match, played: false }))];
}

const matchTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(new Date(value))
    : "Time TBA";

export default async function Home() {
  await connection();
  const [tierList, ph, id] = await Promise.all([
    getHeroTierList("all", 7),
    getLeagueData("ph").catch(() => null),
    getLeagueData("id").catch(() => null),
  ]);
  const heroes = tierList.heroes.filter((hero) => hero.winRate > 0);
  const byTier = [...heroes].sort((a, b) => a.tierOrder - b.tierOrder || b.winRate - a.winRate);
  const leader = byTier[0];
  const mostBanned = [...heroes].sort((a, b) => b.banRate - a.banRate);
  const mostPicked = [...heroes].sort((a, b) => b.pickRate - a.pickRate)[0];
  const movers = heroes.filter((hero) => hero.winRateDelta !== null).sort((a, b) => (b.winRateDelta ?? 0) - (a.winRateDelta ?? 0));
  const riser = movers[0];
  const matches = [...pickMatches("ph", ph?.schedule.value ?? null), ...pickMatches("id", id?.schedule.value ?? null)];

  const medianPick = [...heroes].sort((a, b) => a.pickRate - b.pickRate)[Math.floor(heroes.length / 2)]?.pickRate ?? 0;
  const hiddenGem = byTier.find((hero) => hero.pickRate < medianPick);

  const kpis = [
    leader && { label: "Patch leader", hero: leader, value: <span className="num text-positive">{leader.winRate.toFixed(1)}% WR</span> },
    mostBanned[0] && { label: "Most banned", hero: mostBanned[0], value: <span className="num text-tier-s">{mostBanned[0].banRate.toFixed(1)}% BR</span> },
    mostPicked && { label: "Most picked", hero: mostPicked, value: <span className="num text-text-secondary">{mostPicked.pickRate.toFixed(1)}% PR</span> },
    riser && (riser.winRateDelta ?? 0) > 0
      ? { label: "Biggest riser", hero: riser, value: <DeltaValue value={riser.winRateDelta} suffix=" WR vs 30d" /> }
      : hiddenGem && { label: "Hidden gem", hero: hiddenGem, value: <span className="num text-positive">{hiddenGem.winRate.toFixed(1)}% WR · {hiddenGem.pickRate.toFixed(1)}% PR</span> },
  ].filter(Boolean) as Array<{ label: string; hero: HeroTierListItem; value: React.ReactNode }>;

  return (
    <main>
      <JsonLd data={createWebSiteJsonLd()} />
      <PageContainer className="space-y-4 pt-8 pb-10 sm:pt-12">
        <div className="grid gap-6 pb-2 wide:grid-cols-2 wide:items-end">
          <header className="max-w-[760px]">
            <p className="text-[11px] font-medium tracking-[0.12em] text-accent-text uppercase">
              Mobile Legends stats · all ranks · last 7 days
            </p>
            <h1 className="mt-2.5 text-[30px] leading-[1.05] font-bold tracking-[-0.035em] text-balance sm:text-[44px]">
              Read the field. <span className="text-accent-text">Draft smarter.</span> Win more.
            </h1>
            <HeroSearch size="large" className="mt-6" placeholder="Search a hero…" />
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-text-muted">
              <span>Popular:</span>
              {mostBanned.slice(0, 5).map((hero) => (
                <Link key={hero.heroId} href={`/heroes/${hero.slug}`} className="border-b border-dotted border-border-strong text-text-secondary hover:text-text-primary">
                  {hero.name}
                </Link>
              ))}
            </div>
          </header>

          {kpis.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 wide:grid-cols-2">
              {kpis.map((kpi) => (
                <Link key={kpi.label} href={`/heroes/${kpi.hero.slug}`} className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-card-surface p-3 hover:border-border-strong">
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                    <HeroAvatarImage primarySrc={kpi.hero.image} fallbackSrc={kpi.hero.smallmap} alt="" sizes="40px" />
                  </span>
                  <span className="min-w-0">
                    <span className="eyebrow block">{kpi.label}</span>
                    <span className="flex items-center gap-1.5 truncate text-[15px] font-semibold group-hover:text-accent-text">
                      {kpi.hero.name}
                      {kpi.label === "Patch leader" ? <TierBadge tier={kpi.hero.tier} /> : null}
                    </span>
                    <span className="block truncate text-[12px]">{kpi.value}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 [grid-template-areas:'main''side''esports''tiles'] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:[grid-template-areas:'main_side''esports_esports''tiles_tiles'] wide:grid-cols-[300px_minmax(0,1fr)_340px] wide:grid-rows-[auto_1fr] wide:[grid-template-areas:'side_main_esports''side_main_tiles']">
          <div className="[grid-area:main]">
            <Panel
              title="Top of the tier list"
              action={
                <Link href="/heroes" className="inline-flex items-center gap-1 text-[12px] text-accent-text hover:underline">
                  Full tier list <ArrowRight className="size-3.5" />
                </Link>
              }
            >
              <div className="hidden justify-end gap-2.5 pb-1 wide:flex">
                <span className="eyebrow w-24 text-right">Win</span>
                <span className="eyebrow w-14 text-right">Pick</span>
                <span className="eyebrow w-14 text-right">Ban</span>
                <span className="eyebrow w-14 text-right">vs 30d</span>
              </div>
              <ol>
                {byTier.slice(0, 15).map((hero, index) => (
                  <HeroRow key={hero.heroId} hero={hero} rank={index + 1} className={index >= 10 ? "hidden wide:block" : undefined}>
                    <WinRateValue value={hero.winRate} className="w-24 justify-end text-[12.5px]" />
                    <span className="num hidden w-14 text-right text-[12px] text-text-secondary wide:block">{hero.pickRate.toFixed(1)}%</span>
                    <span className="num hidden w-14 text-right text-[12px] text-tier-s wide:block">{hero.banRate.toFixed(1)}%</span>
                    <span className="hidden w-14 text-right sm:block">
                      <DeltaValue value={hero.winRateDelta} />
                    </span>
                  </HeroRow>
                ))}
              </ol>
            </Panel>
          </div>

          <div className="space-y-4 [grid-area:side]">
            {movers.length > 0 ? (
              <Panel title="Rising this week" action={<span className="text-[11.5px] text-text-muted">WR vs 30-day</span>}>
                <ul>
                  {movers.slice(0, 5).map((hero) => (
                    <HeroRow key={hero.heroId} hero={hero}>
                      <span className="num text-[12px] text-text-secondary">{hero.winRate.toFixed(1)}%</span>
                      <DeltaValue value={hero.winRateDelta} className="w-12 text-right" />
                    </HeroRow>
                  ))}
                </ul>
              </Panel>
            ) : null}
            <Panel title="Ban priority">
              <ul>
                {mostBanned.slice(0, movers.length > 0 ? 5 : 8).map((hero) => (
                  <HeroRow key={hero.heroId} hero={hero}>
                    <span className="num text-[12.5px] text-tier-s">{hero.banRate.toFixed(1)}%</span>
                  </HeroRow>
                ))}
              </ul>
            </Panel>
          </div>

          {matches.length > 0 ? (
            <div className="[grid-area:esports]">
              <Panel
                title="Esports"
                action={
                  <span className="flex gap-3 text-[12px]">
                    <Link href="/esports/ph" className="text-accent-text hover:underline">MPL PH</Link>
                    <Link href="/esports/id" className="text-accent-text hover:underline">MPL ID</Link>
                  </span>
                }
              >
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 wide:grid-cols-1">
                  {matches.map(({ league, match, played }) => {
                    const href = match.id ? `/esports/${league}/matches/${match.id}` : `/esports/${league}`;

                    return (
                      <Link key={`${league}-${match.week}-${match.team1.name}-${match.team2.name}`} href={href} className="space-y-1 rounded-md border border-border-subtle bg-page-background p-3 hover:border-border-strong">
                        <div className="flex justify-between gap-2">
                          <span className="eyebrow">MPL {league.toUpperCase()} · Week {match.week}</span>
                          <span className="text-[11px] text-text-muted">{played ? "Final" : matchTime(match.start)}</span>
                        </div>
                        {[
                          [match.team1, match.score1],
                          [match.team2, match.score2],
                        ].map(([team, score], index) => (
                          <div key={index} className="flex justify-between gap-2 text-[13px]">
                            <span className="truncate font-medium">{(team as ScheduledMatch["team1"]).name}</span>
                            <span className="num text-text-secondary">{played ? (score as number) : "–"}</span>
                          </div>
                        ))}
                      </Link>
                    );
                  })}
                </div>
              </Panel>
            </div>
          ) : null}

          <div className="grid grid-cols-2 content-start gap-3 [grid-area:tiles] lg:grid-cols-4 wide:grid-cols-1">
            {tiles.map((tile) => (
              <Link key={tile.href} href={tile.href} className="flex gap-3 rounded-lg border border-border-subtle p-3.5 hover:border-border-strong hover:bg-card-surface">
                <tile.icon className="mt-0.5 size-4 shrink-0 text-accent-text" />
                <span>
                  <span className="block text-[13px] font-semibold">{tile.label}</span>
                  <span className="block text-[12px] text-text-secondary">{tile.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] text-text-muted">
          {tierList.source === "snapshot" ? "Showing a saved snapshot" : tierList.stale ? "Some feeds were unavailable" : "Live data"} · synced {formatPublicTimestamp(tierList.generatedAt)}
        </p>
      </PageContainer>
    </main>
  );
}
