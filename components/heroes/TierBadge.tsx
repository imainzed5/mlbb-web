import type { HeroTier } from "@/lib/heroes/types";

const tierTextColors: Record<HeroTier, string> = {
  S: "text-tier-s",
  A: "text-tier-a",
  B: "text-tier-b",
  C: "text-tier-c",
};

type TierBadgeProps = {
  tier: HeroTier;
};

export function TierBadge({ tier }: TierBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-page-background px-2 py-1 text-[11px] font-medium ${tierTextColors[tier]}`}
      style={{ border: "0.5px solid var(--border-subtle)" }}
    >
      {tier}
    </span>
  );
}