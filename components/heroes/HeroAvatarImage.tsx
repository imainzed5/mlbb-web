"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type HeroAvatarImageProps = {
  alt: string;
  className?: string;
  fallbackSrc?: string | null;
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
  primarySrc,
  sizes,
}: HeroAvatarImageProps) {
  const sources = useMemo(
    () => normalizeSourceList(primarySrc, fallbackSrc),
    [primarySrc, fallbackSrc]
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sources]);

  const src = sources[sourceIndex] ?? null;

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className ?? "object-cover"}
      onError={() => {
        setSourceIndex((currentIndex) => {
          if (currentIndex >= sources.length - 1) {
            return currentIndex;
          }

          return currentIndex + 1;
        });
      }}
    />
  );
}
