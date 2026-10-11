import { imageUrl, list, number, object, text } from "@/lib/mlbb/records";
import { getPublicCollection } from "@/lib/mlbb/public-data";
import { reportMlbbCollectionFailure } from "@/lib/mlbb/errors";

export type WallpaperVariant = { url: string; width: number; height: number; resolution: string };
export type Wallpaper = { id: string; title: string; heroIds: number[]; variants: WallpaperVariant[] };
export type Gallery = { entries: Wallpaper[]; total: number | null; available: boolean; page: number; device: "desktop" | "mobile" };
export function normalizeWallpapers(records: unknown[], device: "desktop" | "mobile"): Wallpaper[] {
  const entries: Wallpaper[] = [];
  for (const raw of records) {
    const record = object(raw); const data = object(record.data);
    const variants = list(data.pictures).flatMap(raw => {
      const picture = object(raw); const url = imageUrl(picture.url);
      const dimensions = /^(\d+)x(\d+)$/i.exec(text(picture.resolution));
      if (!url || !dimensions) return [];
      const width = Number(dimensions[1]); const height = Number(dimensions[2]);
      if (!width || !height || (device === "desktop" ? width < height : height <= width)) return [];
      return [{ url, width, height, resolution: `${width}×${height}` }];
    });
    const unique = [...new Map(variants.map(variant => [variant.url, variant])).values()].sort((a,b) => a.width*a.height - b.width*b.height);
    const id = text(record._id) || String(number(record.id) ?? "");
    if (!id || !unique.length) continue;
    const heroIds = list(data.heroid).map(number).filter((id): id is number => id !== null);
    const caption = text(record.caption).replace(/_/g, " ");
    entries.push({ id, title: heroIds.length > 1 ? `Event / multi-hero artwork · ${caption || id}` : caption || `Wallpaper ${id}`, heroIds, variants: unique });
  }
  return [...new Map(entries.map(entry => [entry.id, entry])).values()];
}

export async function getWallpaperGallery(device: "desktop" | "mobile", page: number, heroId?: number): Promise<Gallery> {
  const path = heroId ? `/heroes/${heroId}/wallpapers` : "/heroes/wallpapers";
  try {
    const data = await getPublicCollection(`${path}?device=${device}&index=${page}&size=12&lang=en`, 21600);
    return { entries: normalizeWallpapers(data.records, device), total: data.total, available: true, device, page };
  } catch (error) {
    reportMlbbCollectionFailure(path, error);
    return { entries: [], total: null, available: false, device, page };
  }
}

export function galleryFilters(query: { device?: string | string[]; page?: string | string[] }) {
  const device = query.device === "mobile" ? "mobile" : "desktop";
  const input = typeof query.page === "string" && /^\d+$/.test(query.page) ? Number(query.page) : 1;
  return { device, page: Math.max(1, Math.min(1000, input)) } as const;
}
