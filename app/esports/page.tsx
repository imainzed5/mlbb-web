import Link from "next/link";
import { ExploreShell, panelClass } from "@/components/explore/ExploreShell";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({ title: "Esports", description: "Philippine and Indonesian professional MLBB schedules, standings, and match details.", path: "/esports" });
export default function EsportsPage() {
  return <ExploreShell title="MLBB esports" description="Follow the Philippine and Indonesian professional leagues."><div className="grid gap-4 sm:grid-cols-2">{[{ id: "ph", name: "Philippines" }, { id: "id", name: "Indonesia" }].map(league => <Link className={panelClass} key={league.id} href={`/esports/${league.id}`}><h2 className="text-xl font-medium">{league.name}</h2><p className="mt-2 text-sm text-text-secondary">Schedules, standings, and match details →</p></Link>)}</div><Link className="text-accent-text underline" href="/esports/ph">Open Philippines league</Link></ExploreShell>;
}
