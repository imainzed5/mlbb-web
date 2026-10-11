"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, Rows3, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { HERO_ROLES, ROLE_DOT } from "@/lib/heroes/constants";
import type { HeroLane, HeroRole, HeroTierListItem } from "@/lib/heroes/types";
import { cn } from "@/lib/utils";

import { HeroAvatarImage } from "./HeroAvatarImage";
import { HeroGrid } from "./HeroGrid";
import { DeltaValue, WinRateValue } from "./StatCells";
import { TierBadge } from "./TierBadge";

type SortKey = "tier" | "name" | "winRate" | "winRateDelta" | "pickRate" | "banRate";
type Preset = "all" | "rising" | "falling" | "contested" | "gems";

const LANE_LABELS: Record<HeroLane, string> = { exp: "EXP", mid: "Mid", roam: "Roam", jungle: "Jungle", gold: "Gold" };

function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function buildPresets(heroes: HeroTierListItem[], hasDelta: boolean) {
  const medianPick = median(heroes.map((hero) => hero.pickRate));
  const presets: Array<{ id: Preset; label: string; hint: string; test: (hero: HeroTierListItem) => boolean }> = [
    { id: "all", label: "All heroes", hint: "Every hero in the current rank and window", test: () => true },
    { id: "contested", label: "Contested", hint: "Ban rate of 20% or more", test: (hero) => hero.banRate >= 20 },
    {
      id: "gems",
      label: "Hidden gems",
      hint: "52%+ win rate with a below-median pick rate",
      test: (hero) => hero.winRate >= 52 && hero.pickRate < medianPick,
    },
  ];

  if (hasDelta) {
    presets.splice(
      1,
      0,
      { id: "rising", label: "Rising", hint: "Win rate up 1 point or more vs the 30-day baseline", test: (hero) => (hero.winRateDelta ?? 0) >= 1 },
      { id: "falling", label: "Falling", hint: "Win rate down 1 point or more vs the 30-day baseline", test: (hero) => (hero.winRateDelta ?? 0) <= -1 }
    );
  }

  return presets;
}

function compare(a: HeroTierListItem, b: HeroTierListItem, key: SortKey) {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "tier":
      return a.tierOrder - b.tierOrder || b.winRate - a.winRate;
    case "winRateDelta":
      return (b.winRateDelta ?? -Infinity) - (a.winRateDelta ?? -Infinity);
    default:
      return b[key] - a[key] || a.name.localeCompare(b.name);
  }
}

type SortState = { key: SortKey; reverse: boolean };

function SortHeader({ id, label, className, sort, onSort }: { id: SortKey; label: string; className?: string; sort: SortState; onSort: (key: SortKey) => void }) {
  const active = sort.key === id;

  return (
    <th scope="col" aria-sort={active ? (sort.reverse ? "ascending" : "descending") : undefined} className={cn("px-3 py-2.5 font-medium", className)}>
      <button
        type="button"
        onClick={() => onSort(id)}
        className={cn("eyebrow inline-flex items-center gap-1 hover:text-text-secondary", active && "text-accent-text!")}
      >
        {label}
        {active ? <span aria-hidden>{sort.reverse ? "▴" : "▾"}</span> : null}
      </button>
    </th>
  );
}

type TierListClientProps = {
  heroes: HeroTierListItem[];
  hasDelta: boolean;
  baselineLabel: string;
  query: string;
};

export function TierListClient({ heroes, hasDelta, baselineLabel, query }: TierListClientProps) {
  const router = useRouter();
  const [role, setRole] = useState<"All" | HeroRole>("All");
  const [preset, setPreset] = useState<Preset>("all");
  const [sort, setSort] = useState<SortState>({ key: "tier", reverse: false });
  const [view, setView] = useState<"table" | "grid">("table");
  const [filter, setFilter] = useState("");
  const deferredFilter = useDeferredValue(filter.trim().toLowerCase());

  const presets = buildPresets(heroes, hasDelta);
  const activePreset = presets.find((item) => item.id === preset) ?? presets[0];
  const roleFiltered = heroes.filter(
    (hero) =>
      (role === "All" || hero.roles.includes(role)) &&
      (!deferredFilter || hero.name.toLowerCase().includes(deferredFilter))
  );
  const rows = roleFiltered
    .filter(activePreset.test)
    .sort((a, b) => (sort.reverse ? -1 : 1) * compare(a, b, sort.key));

  const heroHref = (slug: string) => `/heroes/${slug}${query}`;
  const onSort = (key: SortKey) => setSort((current) => ({ key, reverse: current.key === key ? !current.reverse : false }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(["All", ...HERO_ROLES] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={role === item}
            onClick={() => setRole(item)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] transition-colors",
              role === item
                ? "border-accent-primary bg-accent-surface text-accent-text"
                : "border-border-subtle bg-card-surface text-text-secondary hover:text-text-primary"
            )}
          >
            {item !== "All" ? <span className="size-1.5 rounded-[2px]" style={{ background: ROLE_DOT[item] }} /> : null}
            {item}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-card-surface px-2 py-1 text-[12px] text-text-muted focus-within:border-accent-primary">
            <Search className="size-3.5" aria-hidden />
            <span className="sr-only">Filter heroes</span>
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter"
              className="w-24 bg-transparent text-text-primary outline-none placeholder:text-text-muted"
            />
          </label>
          <div className="flex rounded-md border border-border-subtle bg-card-surface p-0.5" role="radiogroup" aria-label="View">
            {([
              ["table", Rows3, "Table view"],
              ["grid", LayoutGrid, "Grid view"],
            ] as const).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={view === id}
                aria-label={label}
                title={label}
                onClick={() => setView(id)}
                className={cn("rounded-sm p-1.5", view === id ? "bg-surface-raised text-text-primary" : "text-text-muted hover:text-text-primary")}
              >
                <Icon className="size-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-5 overflow-x-auto border-b border-border-subtle text-[13px]" role="tablist">
          {presets.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              title={item.hint}
              aria-selected={preset === item.id}
              onClick={() => setPreset(item.id)}
              className={cn(
                "-mb-px border-b-2 px-0.5 py-2.5 whitespace-nowrap transition-colors",
                preset === item.id ? "border-accent-primary text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"
              )}
            >
              {item.label}
              <span className="num ml-1.5 text-[11px] text-text-muted">{roleFiltered.filter(item.test).length}</span>
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="rounded-b-lg border border-t-0 border-border-subtle bg-card-surface px-4 py-10 text-center text-[13px] text-text-secondary">
            No heroes match these filters. Try another role or tab.
          </p>
        ) : view === "grid" ? (
          <div className="pt-4">
            <HeroGrid heroes={rows} />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-b-lg border border-t-0 border-border-subtle bg-card-surface">
            <table className="w-full min-w-[560px] border-collapse text-[13px]">
              <thead className="border-b border-border-subtle text-right">
                <tr>
                  <th scope="col" className="eyebrow w-10 px-3 py-2.5 text-left font-medium">#</th>
                  <SortHeader sort={sort} onSort={onSort} id="tier" label="Tier" className="w-14 text-left" />
                  <SortHeader sort={sort} onSort={onSort} id="name" label="Hero" className="text-left" />
                  <SortHeader sort={sort} onSort={onSort} id="winRate" label="Win rate" className="text-right" />
                  {hasDelta ? <SortHeader sort={sort} onSort={onSort} id="winRateDelta" label={baselineLabel} className="text-right" /> : null}
                  <SortHeader sort={sort} onSort={onSort} id="pickRate" label="Pick" className="text-right" />
                  <SortHeader sort={sort} onSort={onSort} id="banRate" label="Ban" className="text-right" />
                  <th scope="col" className="eyebrow hidden px-3 py-2.5 text-left font-medium md:table-cell">Lane</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((hero, index) => (
                  <tr
                    key={hero.heroId}
                    onClick={() => router.push(heroHref(hero.slug))}
                    className="cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-surface-raised"
                  >
                    <td className="num px-3 py-1.5 text-[12px] text-text-muted">{index + 1}</td>
                    <td className="px-3 py-1.5">
                      <TierBadge tier={hero.tier} size="md" />
                    </td>
                    <td className="px-3 py-1.5">
                      <Link
                        href={heroHref(hero.slug)}
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/70"
                      >
                        <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                          <HeroAvatarImage primarySrc={hero.image} fallbackSrc={hero.smallmap} alt="" sizes="32px" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-text-primary">{hero.name}</span>
                          <span className="block text-[11.5px]" style={{ color: ROLE_DOT[hero.primaryRole] }}>
                            {hero.roles.join(" / ")}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <WinRateValue value={hero.winRate} className="justify-end" />
                    </td>
                    {hasDelta ? (
                      <td className="px-3 py-1.5 text-right">
                        <DeltaValue value={hero.winRateDelta} />
                      </td>
                    ) : null}
                    <td className="num px-3 py-1.5 text-right text-text-secondary">{hero.pickRate.toFixed(1)}%</td>
                    <td className={cn("num px-3 py-1.5 text-right", hero.banRate >= 20 ? "text-tier-s" : "text-text-secondary")}>
                      {hero.banRate.toFixed(1)}%
                    </td>
                    <td className="hidden px-3 py-1.5 text-[12px] text-text-secondary md:table-cell">
                      {hero.lanes.map((lane) => LANE_LABELS[lane]).join(", ") || "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
