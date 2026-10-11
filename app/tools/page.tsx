import Link from "next/link";
import { ExploreShell, panelClass } from "@/components/explore/ExploreShell";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({ title: "Tools", description: "MLBB win-rate and league scenario tools.", path: "/tools" });

export default function ToolsPage() {
  return <ExploreShell title="Tools" description="Calculate your next target and explore competitive scenarios.">
    <Link href="/tools/win-rate" className={`${panelClass} block max-w-xl hover:border-accent-primary`}><h2 className="font-medium">Consecutive-win calculator</h2><p className="mt-2 text-sm text-text-secondary">Estimate how many wins without a loss reach your target win rate.</p></Link>
    <Link href="/tools/league-calculator" className={`${panelClass} block max-w-xl hover:border-accent-primary`}><h2 className="font-medium">Custom league calculator</h2><p className="mt-2 text-sm text-text-secondary">Generate a schedule for 2–20 teams, set results, and compare playoff scenarios.</p></Link>
  </ExploreShell>;
}
