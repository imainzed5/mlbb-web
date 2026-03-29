import { HERO_BROWSER_SORT_OPTIONS } from "@/lib/heroes/constants";
import type { HeroBrowserSort } from "@/lib/heroes/types";

type HeroSortSelectProps = {
  value: HeroBrowserSort;
  onChange: (value: HeroBrowserSort) => void;
};

export function HeroSortSelect({ value, onChange }: HeroSortSelectProps) {
  return (
    <label className="inline-flex w-full min-w-0 items-center gap-2 rounded-lg bg-card-surface px-3 py-2 text-[12px] text-text-secondary sm:min-w-40 sm:w-auto" style={{ border: "0.5px solid var(--border-subtle)" }}>
      <span className="sr-only">Sort heroes</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as HeroBrowserSort)}
        className="w-full bg-transparent text-[12px] font-medium text-text-primary outline-none"
      >
        {HERO_BROWSER_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-nav-surface text-text-primary">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}