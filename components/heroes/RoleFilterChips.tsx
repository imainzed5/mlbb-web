import { HERO_ROLES } from "@/lib/heroes/constants";
import type { HeroRole } from "@/lib/heroes/types";

type RoleFilterValue = "All" | HeroRole;

type RoleFilterChipsProps = {
  activeRole: RoleFilterValue;
  onChange: (role: RoleFilterValue) => void;
};

export function RoleFilterChips({
  activeRole,
  onChange,
}: RoleFilterChipsProps) {
  const options: RoleFilterValue[] = ["All", ...HERO_ROLES];

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
      {options.map((role) => {
        const isActive = role === activeRole;

        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={[
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              isActive
                ? "border border-accent-primary bg-accent-surface text-accent-text"
                : "bg-card-surface text-text-secondary hover:text-text-primary",
            ].join(" ")}
            style={{ borderWidth: isActive ? "1px" : "0.5px", borderColor: isActive ? "var(--accent-primary)" : "var(--border-subtle)" }}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}