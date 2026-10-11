import Image from "next/image";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ExploreShell, panelClass } from "@/components/explore/ExploreShell";
import { getAcademyCatalog } from "@/lib/academy/catalog";
import { catalogKind } from "@/lib/academy/normalizers";
import { createPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ kind: string; id: string }>; searchParams: Promise<{ query?: string; category?: string }> };
export async function generateMetadata({ params }: Props) {
  const { kind, id } = await params;
  const validKind = catalogKind(kind);
  const entry = validKind ? (await getAcademyCatalog(validKind)).entries.find(e => e.id === id) : null;
  return createPageMetadata({ title: entry?.name ?? "Academy reference", description: entry?.description.slice(0,155) || "MLBB item, spell, and emblem reference.", path: `/academy/${kind}/${id}` });
}
export default async function EntryPage({ params, searchParams }: Props) {
  await connection();
  const { kind: rawKind, id } = await params;
  const kind = catalogKind(rawKind);
  if (!kind) notFound();
  const filters = await searchParams;
  const returnFilters = new URLSearchParams();
  if (typeof filters.query === "string" && filters.query.length <= 80) returnFilters.set("query", filters.query);
  if (typeof filters.category === "string" && filters.category.length <= 80) returnFilters.set("category", filters.category);
  const backHref = `/academy/${kind}${returnFilters.size ? `?${returnFilters}` : ""}`;
  const catalog = await getAcademyCatalog(kind);
  const entry = catalog.entries.find(e => e.id === id);
  if (!entry && catalog.available && !catalog.partial) notFound();
  if (!entry) return <ExploreShell title="Reference unavailable" description="This entry could not be loaded. Please retry later." back={backHref}><p className={panelClass}>The source catalog is currently incomplete or unavailable.</p></ExploreShell>;
  return <ExploreShell title={entry.name} description={entry.category} back={backHref}>
    <article className={`${panelClass} max-w-3xl space-y-6`}>
      {entry.image && <Image src={entry.image} alt={entry.name} width={96} height={96} className="rounded-2xl" />}
      {entry.attributes && <section><h2 className="mb-2 font-medium">Attributes</h2><p className="whitespace-pre-line text-sm leading-7 text-text-secondary">{entry.attributes}</p></section>}
      <section><h2 className="mb-2 font-medium">Effects</h2><p className="whitespace-pre-line text-sm leading-7 text-text-secondary">{entry.description || "No effect description is published for this entry."}</p></section>
      {entry.tips && <p className="whitespace-pre-line text-sm leading-7">{entry.tips}</p>}
    </article>
  </ExploreShell>;
}
