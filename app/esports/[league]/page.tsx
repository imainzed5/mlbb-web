import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ExploreShell, actionClass, panelClass } from "@/components/explore/ExploreShell";
import { getLeagueData, leagueName, leagueValue, manilaTime } from "@/lib/esports/data";
import { createPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ league: string }>; searchParams: Promise<{ week?: string }> };
export async function generateMetadata({ params }: Props) { const league = leagueValue((await params).league); return createPageMetadata({ title: `${league ? leagueName[league] : "League"} esports`, description: "Professional MLBB schedules, standings, and results.", path: `/esports/${league || "ph"}` }); }
export default async function LeaguePage({ params, searchParams }: Props) {
  await connection(); const league = leagueValue((await params).league); if (!league) notFound();
  const [data, filters] = await Promise.all([getLeagueData(league), searchParams]);
  const weeks = [...new Set(data.schedule.value?.map(match => match.week) ?? [])].sort((a,b) => a-b);
  const selectedWeek = typeof filters.week === "string" && weeks.includes(Number(filters.week)) ? Number(filters.week) : null;
  const matches = data.schedule.value?.filter(match => selectedWeek === null || match.week === selectedWeek) ?? [];
  return <ExploreShell title={`${leagueName[league]} esports`} description="Regular-season results and upcoming matches. Times shown in Asia/Manila (UTC+8)." back="/esports">
    <nav aria-label="League" className="flex gap-3">{(["ph", "id"] as const).map(id => <Link key={id} className={actionClass} aria-current={league === id ? "page" : undefined} href={`/esports/${id}`}>{leagueName[id]}</Link>)}</nav>
    <Link className={actionClass} href={`/esports/${league}/simulator`}>Explore playoff scenarios</Link>
    <p className="text-xs text-text-secondary">View loaded {manilaTime(data.retrievedAt)} · Public data may be cached for up to 5 minutes; this is not a source sync timestamp. <a className="text-accent-text underline" href={`/esports/${league}${selectedWeek ? `?week=${selectedWeek}` : ""}`}>Reload view</a></p>
    <section className={`${panelClass} space-y-4`}><h2 className="text-lg font-medium">Standings</h2>{!data.standings.available ? <p>Standings are temporarily unavailable. Try reloading the view.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><caption className="sr-only">{leagueName[league]} standings</caption><thead><tr>{["Rank", "Team", "Points", "Matches W–L", "Games W–L", "Net games"].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead><tbody>{data.standings.value?.map(row => <tr key={row.team.name} className="border-t border-border-subtle"><td className="p-3">{row.rank ?? "—"}</td><th className="p-3 font-medium"><span className="flex items-center gap-2">{row.team.logo && <Image src={row.team.logo} alt="" width={28} height={28} />}{row.team.name}</span></th><td className="p-3">{row.points ?? "—"}</td><td className="p-3">{row.wins ?? "—"}–{row.losses ?? "—"}</td><td className="p-3">{row.gameWins ?? "—"}–{row.gameLosses ?? "—"}</td><td className="p-3">{row.net ?? "—"}</td></tr>)}</tbody></table>{!data.standings.value?.length && <p>No standings published.</p>}</div>}</section>
    <section className="space-y-4"><h2 className="text-lg font-medium">Schedule</h2><nav aria-label="Schedule week" className="flex flex-wrap gap-2"><Link className={actionClass} aria-current={selectedWeek === null ? "page" : undefined} href={`/esports/${league}`}>All weeks</Link>{weeks.map(week => <Link key={week} className={actionClass} aria-current={selectedWeek === week ? "page" : undefined} href={`/esports/${league}?week=${week}`}>Week {week}</Link>)}</nav>
      {!data.schedule.available ? <p className={panelClass}>Schedule is temporarily unavailable.</p> : <div className="grid gap-4 md:grid-cols-2">{matches.map((match,index) => <article key={`${match.week}:${match.id ?? index}`} className={`${panelClass} space-y-3`}><p className="text-xs text-text-secondary">Week {match.week} · {manilaTime(match.start)}</p><div className="flex items-center justify-between gap-4"><span>{match.team1.name}</span><strong>{match.score1 !== null && match.score2 !== null ? `${match.score1}–${match.score2}` : "Upcoming / no result"}</strong><span>{match.team2.name}</span></div>{match.id ? <Link className="text-sm text-accent-text underline" href={`/esports/${league}/matches/${match.id}${selectedWeek ? `?week=${selectedWeek}` : ""}`}>View match details</Link> : <p className="text-xs text-text-secondary">Match details not yet available.</p>}</article>)}</div>}{data.schedule.available && !matches.length && <p className={panelClass}>No matches published for this selection.</p>}
    </section>
  </ExploreShell>;
}
