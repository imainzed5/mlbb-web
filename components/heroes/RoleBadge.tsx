import { ROLE_BADGE_STYLES } from "@/lib/heroes/constants";
import type { HeroRole } from "@/lib/heroes/types";

type RoleBadgeProps = {
  role: HeroRole;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = ROLE_BADGE_STYLES[role];

  return (
    <span
      className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11.5px] font-medium"
      style={{
        backgroundColor: styles.background,
        color: styles.text,
      }}
    >
      {role}
    </span>
  );
}