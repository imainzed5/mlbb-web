"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import type { HeroBrowserItem, HeroBrowserPayload } from "@/lib/heroes/types";
import { cn } from "@/lib/utils";

type HeroSearchProps = {
  className?: string;
  size?: "compact" | "large";
  placeholder?: string;
};

let heroListPromise: Promise<HeroBrowserItem[]> | null = null;

function loadHeroes() {
  heroListPromise ??= fetch("/api/heroes")
    .then((response) => (response.ok ? (response.json() as Promise<HeroBrowserPayload>) : null))
    .then((payload) => payload?.heroes ?? [])
    .catch(() => {
      heroListPromise = null;
      return [];
    });

  return heroListPromise;
}

export function HeroSearch({ className, size = "compact", placeholder = "Search heroes" }: HeroSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [heroes, setHeroes] = useState<HeroBrowserItem[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? heroes
        .filter((hero) => hero.name.toLowerCase().includes(normalized))
        .sort((a, b) => Number(!a.name.toLowerCase().startsWith(normalized)) - Number(!b.name.toLowerCase().startsWith(normalized)))
        .slice(0, 7)
    : [];

  useEffect(() => {
    if (size !== "compact") return;

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key !== "/" || target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [size]);

  function warm() {
    if (heroes.length === 0) void loadHeroes().then(setHeroes);
  }

  function go(hero: HeroBrowserItem) {
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
    router.push(`/heroes/${hero.slug}`);
  }

  const large = size === "large";

  return (
    <div className={cn("relative", className)}>
      <label
        className={cn(
          "flex items-center gap-2 border border-border-subtle bg-page-background text-text-muted transition-colors focus-within:border-accent-primary",
          large ? "rounded-lg px-4 py-3.5 text-[15px] shadow-[0_0_0_4px_rgb(55_138_221/8%)]" : "rounded-md px-2.5 py-1.5 text-[13px]"
        )}
      >
        <Search className={large ? "size-4.5" : "size-3.5"} strokeWidth={2} aria-hidden />
        <span className="sr-only">Search heroes</span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            warm();
            setOpen(true);
          }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Enter" && results[activeIndex]) {
              event.preventDefault();
              go(results[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {!large ? (
          <kbd className="hidden rounded border border-border-strong px-1.5 font-mono text-[10.5px] lg:inline">/</kbd>
        ) : null}
      </label>

      {open && results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-border-strong bg-card-surface py-1 shadow-xl"
        >
          {results.map((hero, index) => (
            <li key={hero.heroId} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(hero)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-[13px]",
                  index === activeIndex ? "bg-surface-raised text-text-primary" : "text-text-secondary"
                )}
              >
                <span className="relative size-7 shrink-0 overflow-hidden rounded bg-surface-raised">
                  {hero.image ? <Image src={hero.image} alt="" fill sizes="28px" className="object-cover" /> : null}
                </span>
                <span className="flex-1 truncate font-medium">{hero.name}</span>
                <span className="text-[11px] text-text-muted">{hero.primaryRole}</span>
                <span className="num w-12 text-right text-[12px] text-text-secondary">{hero.winRate.toFixed(1)}%</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
