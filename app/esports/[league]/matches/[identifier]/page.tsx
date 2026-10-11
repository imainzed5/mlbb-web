import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ExploreShell, actionClass, panelClass } from "@/components/explore/ExploreShell";
import { getMatchData, leagueName, leagueValue, matchIdentifier } from "@/lib/esports/data";
import { getAcademyCatalog } from "@/lib/academy/catalog";
import { createPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ league: string; identifier: string }>; searchParams: Promise<{ game?: string; week?: string }> };
export async function generateMetadata({ params }: Props) { const { league, identifier } = await params; return createPageMetadata({ title: `Match ${identifier}`, description: "MLBB professional match game statistics, player builds, and available purchase sequences.", path: `/esports/${league}/matches/${identifier}` }); }
export default async function MatchPage({ params, searchParams }: Props) {
  await connection(); const { league: input, identifier } = await params; const league = leagueValue(input);
  if (!league || !matchIdentifier(league, identifier)) notFound();
  const [games, filters] = await Promise.all([getMatchData(league, identifier), searchParams]);
  const path = `/esports/${league}/matches/${identifier}`;
  const week = typeof filters.week === "string" && /^\d{1,3}$/.test(filters.week) && Number(filters.week) >= 1 && Number(filters.week) <= 100 ? Number(filters.week) : null;
  const back = `/esports/${league}${week ? `?week=${week}` : ""}`;
  const weekQuery = week ? `&week=${week}` : "";
  if (!games) return <ExploreShell title="Match details unavailable" description="The source may not yet publish details for this match." back={back}><p className={panelClass}><a href={`${path}${week ? `?week=${week}` : ""}`} className="text-accent-text underline">Retry loading match</a></p></ExploreShell>;
  const selected = Number(filters.game ?? 1); const index = Number.isInteger(selected) && selected > 0 && selected <= games.length ? selected - 1 : 0;
  const game = games[index];
  const items = (await getAcademyCatalog("items")).entries;
  const itemById = new Map(items.map(item => [item.id, item]));
  function asset(asset: { id: string; image: string | null }, label: string) {
    return <span className="inline-flex items-center gap-1 rounded-lg border border-border-subtle px-2 py-1">{asset.image && <Image src={asset.image} alt="" width={24} height={24} />}<span>{label} {asset.id}</span></span>;
  }
  return <ExploreShell title={`${leagueName[league]} match details`} description={identifier.replace(/-/g, " ")} back={back}>
    <nav aria-label="Match game" className="flex flex-wrap gap-3">{games.map((game,i) => <Link key={i} href={`${path}?game=${i+1}${weekQuery}`} className={actionClass} aria-current={index === i ? "page" : undefined}>Game {game.number ?? i+1}</Link>)}</nav>
    {!game ? <p className={panelClass}>No game details published.</p> : <>
      <p className="text-sm text-text-secondary">Game {game.number ?? index+1} · Duration {game.duration || "unavailable"} · Source details may be incomplete; unknown values are shown as unavailable.</p>
      {game.teams.map((side, sideIndex) => <section key={`${side.team.name}:${sideIndex}`} className={`${panelClass} space-y-5`}>
        <div className="flex items-center gap-3">{side.team.logo && <Image src={side.team.logo} alt="" width={40} height={40} />}<h2 className="text-xl font-medium">{side.team.fullName || side.team.name}</h2><span className="text-sm text-accent-text">{side.winner === true ? "Winner" : side.winner === false ? "Defeated" : "Winner not supplied"}</span></div>
        <p className="text-sm">Team kills: {side.kills ?? "Unavailable"}</p>
        {side.stats.length > 0 && <details><summary className="cursor-pointer text-sm text-accent-text">Team statistics</summary><dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{side.stats.map(stat => <div key={stat.label}><dt className="text-xs text-text-secondary">{stat.label}</dt><dd className="text-sm">{stat.value.toLocaleString()}</dd></div>)}</dl></details>}
        <div className="space-y-4">{side.players.map((player, playerIndex) => <article key={`${player.name}:${playerIndex}`} className="space-y-4 rounded-xl border border-border-subtle bg-page-background p-4">
          <header className="flex items-center gap-3">{player.hero.image && <Image src={player.hero.image} alt="" width={40} height={40} />}<div><h3 className="font-medium">{player.name}</h3><p className="text-xs text-text-secondary">{player.hero.name}</p></div><span className="ml-auto text-sm">{player.kills ?? "—"}/{player.deaths ?? "—"}/{player.assists ?? "—"}</span></header>
          <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">{[{ label: "KDA", value: player.kda }, { label: "Gold", value: player.gold }, { label: "Damage dealt", value: player.damage }, { label: "Damage taken", value: player.damageTaken }, { label: "Tower damage", value: player.towerDamage }].map(stat => <div key={stat.label}><dt className="text-text-secondary">{stat.label}</dt><dd className="mt-1">{stat.value?.toLocaleString() ?? "Unavailable"}</dd></div>)}</dl>
          <div><h4 className="mb-2 text-xs text-text-secondary">Final items</h4><div className="flex flex-wrap gap-2 text-xs">{player.items.map((item,i) => { const known = itemById.get(item.id); return known ? <Link key={i} className="text-accent-text underline" href={`/academy/items/${known.id}`}>{asset(item, known.name)}</Link> : <span key={i}>{asset(item, "Item")}</span>; })}{!player.items.length && <span>Unavailable</span>}</div></div>
          <div className="flex flex-wrap gap-2 text-xs">{player.emblem && asset(player.emblem, "Emblem")}{player.talents.map((talent,i) => <span key={i}>{asset(talent, "Talent")}</span>)}</div>
          {player.sequence.length > 0 && <details><summary className="cursor-pointer text-sm text-accent-text">Item purchase sequence</summary><ol className="mt-3 flex flex-wrap gap-2 text-xs">{player.sequence.map((item,i) => <li key={i} className="rounded-xl border border-border-subtle p-2"><span className="mb-1 block text-text-secondary">{i+1}. {item.timelinePercent === null ? "Time unavailable" : `${item.timelinePercent.toFixed(1)}% of game timeline`}</span>{asset(item, itemById.get(item.id)?.name || "Item")}</li>)}</ol></details>}
        </article>)}</div>
      </section>)}
    </>}
  </ExploreShell>;
}
