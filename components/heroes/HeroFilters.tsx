import { LayoutGrid, Rows3, Search } from "lucide-react";

import type { HeroBrowserSort, HeroRole } from "@/lib/heroes/types";

import { HeroSortSelect } from "./HeroSortSelect";
import { RoleFilterChips } from "./RoleFilterChips";

type RoleFilterValue = "All" | HeroRole;
type HeroViewMode = "grid" | "list";

type HeroFiltersProps = {
  query: string;
  activeRole: RoleFilterValue;
  activeSort: HeroBrowserSort;
  activeView: HeroViewMode;
  onQueryChange: (query: string) => void;
  onRoleChange: (role: RoleFilterValue) => void;
  onSortChange: (sort: HeroBrowserSort) => void;
  onViewChange: (view: HeroViewMode) => void;
};

export function HeroFilters({
  query,
  activeRole,
  activeSort,
  activeView,
  onQueryChange,
  onRoleChange,
  onSortChange,
  onViewChange,
}: HeroFiltersProps) {
  return (
    <div
      className="space-y-3 rounded-2xl bg-card-surface/72 p-3.5 sm:space-y-4 sm:p-4"
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      <label
        className="flex items-center gap-3 rounded-xl bg-page-background/75 px-3 py-2.5 sm:px-4 sm:py-3"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      >
        <Search className="size-4 text-text-muted" strokeWidth={1.8} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search heroes by name"
          className="w-full bg-transparent text-[14px] text-text-primary placeholder:text-[#3e4656] outline-none"
        />
      </label>

      <RoleFilterChips activeRole={activeRole} onChange={onRoleChange} />

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:justify-end">
        <div
          className="inline-flex items-center rounded-lg bg-page-background/75 p-1"
          style={{ border: "0.5px solid var(--border-subtle)" }}
        >
          <button
            type="button"
            aria-pressed={activeView === "grid"}
            onClick={() => onViewChange("grid")}
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              activeView === "grid"
                ? "bg-accent-surface text-accent-text"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            <LayoutGrid className="size-3.5" strokeWidth={2} />
            <span className="hidden xs:inline">Grid</span>
          </button>
          <button
            type="button"
            aria-pressed={activeView === "list"}
            onClick={() => onViewChange("list")}
            className={[
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              activeView === "list"
                ? "bg-accent-surface text-accent-text"
                : "text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            <Rows3 className="size-3.5" strokeWidth={2} />
            <span className="hidden xs:inline">List</span>
          </button>
        </div>
        <HeroSortSelect value={activeSort} onChange={onSortChange} />
      </div>
    </div>
  );
}