import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ExploreShell } from "@/components/explore/ExploreShell";
import { WallpaperGallery } from "@/components/wallpapers/WallpaperGallery";
import { getHeroCatalogItemBySlug } from "@/lib/hero/getHeroCatalog";
import { galleryFilters, getWallpaperGallery } from "@/lib/wallpapers/gallery";
import { createPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ device?: string; page?: string }> };
export async function generateMetadata({ params }: Props) {
  const hero = await getHeroCatalogItemBySlug((await params).slug);
  return createPageMetadata({ title: `${hero?.name || "Hero"} wallpapers`, description: "Desktop and mobile hero artwork with source-resolution links.", path: `/heroes/${(await params).slug}/wallpapers` });
}
export default async function HeroWallpapersPage({ params, searchParams }: Props) {
  await connection();
  const hero = await getHeroCatalogItemBySlug((await params).slug);
  if (!hero) notFound();
  const filters = galleryFilters(await searchParams);
  const gallery = await getWallpaperGallery(filters.device, filters.page, hero.heroId);
  return <ExploreShell title={`${hero.name} wallpapers`} description="Hero-tagged artwork may include event or multi-hero scenes. Choose a device and open the source resolution." back={`/heroes/${hero.slug}`}><WallpaperGallery gallery={gallery} path={`/heroes/${hero.slug}/wallpapers`} /></ExploreShell>;
}
