import { connection } from "next/server";
import { notFound } from "next/navigation";
import { CatalogExplorer } from "@/components/academy/CatalogExplorer";
import { ExploreShell } from "@/components/explore/ExploreShell";
import { getAcademyCatalog } from "@/lib/academy/catalog";
import { catalogKind } from "@/lib/academy/normalizers";
import { createPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ kind: string }>; searchParams: Promise<{ query?: string; category?: string }> };
export async function generateMetadata({ params }: Props) {
  const { kind } = await params;
  return createPageMetadata({ title: `Academy ${kind}`, description: "Search MLBB reference data and inspect detailed effects.", path: `/academy/${kind}` });
}
export default async function CatalogPage({ params, searchParams }: Props) {
  await connection();
  const kind = catalogKind((await params).kind);
  if (!kind) notFound();
  const [catalog, filters] = await Promise.all([getAcademyCatalog(kind), searchParams]);
  const title = { items: "Equipment", spells: "Battle spells", emblems: "Emblems & talents" }[kind];
  return <ExploreShell title={title} description="Find a reference entry, inspect its effects, and open a shareable detail page." back="/academy">
    <CatalogExplorer key={`${kind}:${filters.query}:${filters.category}`} catalog={catalog} kind={kind} initialQuery={typeof filters.query === "string" ? filters.query : ""} initialCategory={typeof filters.category === "string" ? filters.category : "all"} />
  </ExploreShell>;
}
