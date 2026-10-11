import Link from "next/link";
import { getWallpaperGallery } from "@/lib/wallpapers/gallery";
import { WallpaperImage } from "@/components/wallpapers/WallpaperImage";
import { panelClass } from "@/components/explore/ExploreShell";

export async function HeroWallpaperPreview({ heroId, slug }: { heroId: number; slug: string }) {
  const gallery = await getWallpaperGallery("desktop", 1, heroId);
  return <section className={`${panelClass} space-y-4`}><div className="flex items-center justify-between gap-4"><h2 className="font-medium">Hero artwork</h2><Link className="text-sm text-accent-text underline" href={`/heroes/${slug}/wallpapers`}>View wallpapers</Link></div><div className="grid gap-3 sm:grid-cols-3">{gallery.entries.slice(0,3).map(entry => <Link key={entry.id} href={`/heroes/${slug}/wallpapers`} className="relative aspect-video overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-accent-primary"><WallpaperImage src={entry.variants[0].url} alt={entry.title} sizes="(max-width: 640px) 90vw, 25vw" /></Link>)}</div>{!gallery.entries.length && <p className="text-sm text-text-secondary">Open the gallery to check other devices or retry available artwork.</p>}</section>;
}
