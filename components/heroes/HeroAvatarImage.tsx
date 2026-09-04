"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type HeroAvatarImageProps = {
  alt: string;
  className?: string;
  fallbackSrc?: string | null;
  preload?: boolean;
  primarySrc: string | null;
  sizes: string;
};

function normalizeSourceList(primarySrc: string | null, fallbackSrc: string | null | undefined) {
  const candidates = [primarySrc, fallbackSrc]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(candidates));
}

export function HeroAvatarImage({
  alt,
  className,
  fallbackSrc,
  preload = false,
  primarySrc,
  sizes,
}: HeroAvatarImageProps) {
  const sources = useMemo(
    () => normalizeSourceList(primarySrc, fallbackSrc),
    [primarySrc, fallbackSrc]
  );
  const sourceKey = sources.join("\u0000");
  const [failedSource, setFailedSource] = useState<{ key: string; index: number } | null>(null);
  const sourceIndex = failedSource?.key === sourceKey ? failedSource.index : 0;

  const src = sources[sourceIndex] ?? null;

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      preload={preload}
      sizes={sizes}
      className={className ?? "object-cover"}
      onError={() => {
        setFailedSource((current) => {
          const currentIndex = current?.key === sourceKey ? current.index : 0;

          if (currentIndex >= sources.length - 1) {
            return current ?? { key: sourceKey, index: currentIndex };
          }

          return { key: sourceKey, index: currentIndex + 1 };
        });
      }}
    />
  );
}
