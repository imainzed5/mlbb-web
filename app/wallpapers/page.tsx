import { connection } from "next/server";
import { ExploreShell } from "@/components/explore/ExploreShell";
import { WallpaperGallery } from "@/components/wallpapers/WallpaperGallery";
import { galleryFilters, getWallpaperGallery } from "@/lib/wallpapers/gallery";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({ title: "Wallpapers", description: "Browse desktop and mobile MLBB artwork with full-resolution image links.", path: "/wallpapers" });
export default async function WallpapersPage({ searchParams }: { searchParams: Promise<{ device?: string; page?: string }> }) {
  await connection();
  const filters = galleryFilters(await searchParams);
  const gallery = await getWallpaperGallery(filters.device, filters.page);
  return <ExploreShell title="Wallpapers" description="Browse source artwork by device and open available resolutions."><WallpaperGallery gallery={gallery} path="/wallpapers" /></ExploreShell>;
}
