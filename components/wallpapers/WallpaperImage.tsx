"use client";

import Image from "next/image";
import { useState } from "react";

export function WallpaperImage({ src, alt, sizes, contain = false }: { src: string; alt: string; sizes: string; contain?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className="flex h-full items-center justify-center bg-card-surface-strong p-4 text-center text-sm text-text-secondary">Image unavailable. Try opening its full-resolution source.</div> : <Image src={src} alt={alt} fill sizes={sizes} className={contain ? "object-contain" : "object-cover"} onError={() => setFailed(true)} />;
}
