"use client";

import { WallpaperImage } from "./WallpaperImage";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Gallery, Wallpaper } from "@/lib/wallpapers/gallery";
import { actionClass, panelClass } from "@/components/explore/ExploreShell";

export function WallpaperGallery({ gallery, path }: { gallery: Gallery; path: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Wallpaper | null>(null);
  function open(entry: Wallpaper) { setSelected(entry); dialog.current?.showModal(); }
  const source = selected?.variants.at(-1);
  const canAdvance = gallery.total === null ? gallery.entries.length === 12 : gallery.page * 12 < gallery.total;
  return <div className="space-y-5">
    <nav aria-label="Wallpaper device" className="flex gap-3">{(["desktop", "mobile"] as const).map(device => <Link aria-current={gallery.device === device ? "page" : undefined} key={device} className={`${actionClass} ${gallery.device === device ? "ring-2 ring-accent-primary" : ""}`} href={`${path}?device=${device}&page=1`}>{device === "desktop" ? "Desktop" : "Mobile"}</Link>)}</nav>
    {!gallery.available ? <div className={panelClass}><p>Wallpapers are temporarily unavailable.</p><a href={`${path}?device=${gallery.device}&page=${gallery.page}`} className="text-accent-text underline">Retry</a></div> : <>
      <p className="text-sm text-text-secondary">Page {gallery.page}{gallery.total !== null && ` · ${gallery.total} source records`}. Resolution variants are grouped together.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{gallery.entries.map(entry => {
        const preview = entry.variants[0];
        return <button key={entry.id} type="button" aria-haspopup="dialog" className="overflow-hidden rounded-2xl border border-border-subtle bg-card-surface text-left focus-visible:ring-2 focus-visible:ring-accent-primary" onClick={() => open(entry)}>
          <div className={`relative ${gallery.device === "mobile" ? "aspect-[9/16]" : "aspect-video"}`}><WallpaperImage key={preview.url} src={preview.url} alt={entry.title} sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw" /></div><div className="p-4"><h2 className="text-sm font-medium">{entry.title}</h2><p className="mt-2 text-xs text-text-secondary">{entry.variants.length} resolution{entry.variants.length === 1 ? "" : "s"} · Open image</p></div>
        </button>;
      })}</div>
      {!gallery.entries.length && <p className={panelClass}>No artwork with a supported {gallery.device} resolution is published on this page.</p>}
      <nav aria-label="Wallpaper pages" className="flex items-center gap-4">{gallery.page > 1 && <Link className={actionClass} href={`${path}?device=${gallery.device}&page=${gallery.page-1}`}>Previous</Link>}{canAdvance && gallery.page < 1000 && <Link className={actionClass} href={`${path}?device=${gallery.device}&page=${gallery.page+1}`}>Next page</Link>}</nav>
    </>}
    <dialog ref={dialog} className="m-auto max-h-[92dvh] w-[min(94vw,1100px)] overflow-auto rounded-2xl border border-border-subtle bg-card-surface p-5 text-text-primary backdrop:bg-black/75" aria-label={selected?.title || "Wallpaper viewer"} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="mb-4 flex justify-between gap-4"><h2 className="font-medium">{selected?.title}</h2><button className={actionClass} type="button" autoFocus onClick={() => dialog.current?.close()}>Close</button></div>
      {source && <div className="relative h-[55dvh]"><WallpaperImage key={source.url} src={source.url} alt={selected?.title || "Wallpaper"} sizes="90vw" contain /></div>}
      <div className="mt-5 flex flex-wrap gap-3">{selected?.variants.map(variant => <a key={variant.url} href={variant.url} target="_blank" rel="noopener noreferrer" className={actionClass}>Open full image · {variant.resolution}</a>)}</div><p className="mt-4 text-xs text-text-secondary">Use your browser’s save-image action after opening the full image. Artwork © MOONTON.</p>
    </dialog>
  </div>;
}
