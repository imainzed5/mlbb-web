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
                ? ""
                : "bg-card-surface text-text-secondary hover:text-text-primary",
            ].join(" ")}
            style={{
              background: isActive ? "#2d2414" : undefined,
              border: isActive ? "1px solid #8f6a10" : "0.5px solid var(--border-subtle)",
              borderWidth: isActive ? "1px" : "0.5px",
              color: isActive ? "#fcd34d" : undefined,
              WebkitTextFillColor: isActive ? "#fcd34d" : undefined,
            }}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}
