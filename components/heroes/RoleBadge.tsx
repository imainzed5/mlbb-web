import { ROLE_BADGE_STYLES } from "@/lib/heroes/constants";
import type { HeroRole } from "@/lib/heroes/types";

type RoleBadgeProps = {
  role: HeroRole;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = ROLE_BADGE_STYLES[role];

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium"
      style={{
        backgroundColor: styles.background,
        color: styles.text,
      }}
    >
      {role}
    </span>
  );
}