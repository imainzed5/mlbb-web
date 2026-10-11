import { ExploreShell } from "@/components/explore/ExploreShell";
import { ScenarioBuilder } from "@/components/esports/ScenarioBuilder";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({ title: "Custom league calculator", description: "Generate a custom MLBB league schedule and explore standings and playoff scenarios.", path: "/tools/league-calculator", noIndex: true });
export default function LeagueCalculatorPage() { return <ExploreShell title="Custom league calculator" description="Name your teams, generate a schedule, and enter match results. Finished matches are best-of-three." back="/tools"><ScenarioBuilder kind="custom" initial={null} /></ExploreShell>; }
