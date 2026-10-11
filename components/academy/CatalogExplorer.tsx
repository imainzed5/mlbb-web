"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AcademyCatalog, AcademyKind } from "@/lib/academy/types";
import { fieldClass, panelClass } from "@/components/explore/ExploreShell";

export function CatalogExplorer({ catalog, kind }: {
  catalog: AcademyCatalog; kind: AcademyKind; initialQuery?: string; initialCategory?: string;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const category = searchParams.get("category") ?? "all";
  const categories = [...new Set(catalog.entries.map(e => e.category))].sort();
  function update(nextQuery: string, nextCategory: string) {
    const url = new URL(window.location.href);
    if (nextQuery) url.searchParams.set("query", nextQuery); else url.searchParams.delete("query");
    if (nextCategory !== "all") url.searchParams.set("category", nextCategory); else url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  }
  const entries = catalog.entries.filter(e => e.name.toLowerCase().includes(query.toLowerCase()) &&
    (category === "all" || e.category === category));
  const returnFilters = new URLSearchParams();
  if (query) returnFilters.set("query", query);
  if (category !== "all") returnFilters.set("category", category);
  const detailQuery = returnFilters.size ? `?${returnFilters}` : "";
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-[1fr_240px]">
      <label className="space-y-2 text-sm">Search {kind}<input className={fieldClass} value={query} maxLength={80} onChange={e => update(e.target.value, category)} placeholder="Search by name…" /></label>
      <label className="space-y-2 text-sm">Category<select className={fieldClass} value={category} onChange={e => update(query, e.target.value)}><option value="all">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
    </div>
    {catalog.partial && <p role="status" className="text-warning-soft">Some catalog entries are unavailable. The available entries are shown below.</p>}
    {!catalog.available ? <div className={panelClass}><p>The catalog is temporarily unavailable.</p><a className="text-accent-text underline" href={`/academy/${kind}`}>Retry loading</a></div> : <>
      <p className="text-sm text-text-secondary">{entries.length} entries · Search covers the loaded catalog.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{entries.map(entry => <Link key={entry.id} href={`/academy/${kind}/${entry.id}${detailQuery}`} className={`${panelClass} transition-colors hover:border-accent-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary`}>
        <div className="flex items-center gap-4">{entry.image && <Image src={entry.image} alt="" width={56} height={56} className="rounded-xl" />}<div><h2 className="font-medium">{entry.name}</h2><p className="mt-1 text-xs text-accent-text">{entry.category}</p></div></div>
        <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm leading-6 text-text-secondary">{entry.attributes || entry.description || "Open for details."}</p>
      </Link>)}</div>
      {entries.length === 0 && <p className={panelClass}>No entries match these filters. Try a different name or category.</p>}
    </>}
  </div>;
}
