import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ExploreShell } from "@/components/explore/ExploreShell";
import { ScenarioBuilder } from "@/components/esports/ScenarioBuilder";
import { getLeagueData, leagueName, leagueValue } from "@/lib/esports/data";
import { runSimulation } from "@/lib/esports/simulation";
import { createPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ league: string }> }) { const league = leagueValue((await params).league); return createPageMetadata({ title: `${league ? leagueName[league] : "League"} playoff simulator`, description: "Explore playoff scenarios with edited results and before/after standings.", path: `/esports/${league || "ph"}/simulator`, noIndex: true }); }
export default async function SimulatorPage({ params }: { params: Promise<{ league: string }> }) {
  await connection(); const league = leagueValue((await params).league); if (!league) notFound();
  const [initial, actual] = await Promise.all([runSimulation(league, { results: [], model: "form" }).catch(() => null), getLeagueData(league)]);
  return <ExploreShell title={`${leagueName[league]} playoff simulator`} description="Start from actual results, edit scores, and compare the resulting standings. Scenarios are estimates, not official league decisions." back={`/esports/${league}`}><ScenarioBuilder kind={league} initial={initial} published={actual.standings.value ?? []} /></ExploreShell>;
}
