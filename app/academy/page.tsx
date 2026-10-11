import Link from "next/link";
import { ExploreShell, panelClass } from "@/components/explore/ExploreShell";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({ title: "Academy", description: "Explore MLBB equipment, battle spells, emblem families, and talents.", path: "/academy" });
export default function AcademyPage() {
  return <ExploreShell title="MLBB Academy" description="Look up item effects, battle spells, and emblem talents before choosing your next build.">
    <div className="grid gap-4 sm:grid-cols-3">{[
      { path: "items", title: "Equipment", detail: "Search items, attributes, and passive effects." },
      { path: "spells", title: "Battle spells", detail: "Understand each spell and its effects." },
      { path: "emblems", title: "Emblems & talents", detail: "Compare base attributes and talent tiers." },
    ].map(x => <Link key={x.path} className={`${panelClass} hover:border-accent-primary`} href={`/academy/${x.path}`}><h2 className="text-lg font-medium">{x.title} →</h2><p className="mt-2 text-sm text-text-secondary">{x.detail}</p></Link>)}</div>
  </ExploreShell>;
}
