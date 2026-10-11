import { ExploreShell } from "@/components/explore/ExploreShell";
import { WinRateCalculator } from "@/components/tools/WinRateCalculator";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({ title: "Win-rate calculator", description: "Estimate consecutive wins needed to reach a target MLBB win rate.", path: "/tools/win-rate" });
export default function WinRatePage() {
  return <ExploreShell title="Consecutive-win calculator" description="Enter your current record and a target. This calculation assumes you win every additional match." back="/tools"><WinRateCalculator /></ExploreShell>;
}
