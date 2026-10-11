import type { HeroTier } from "@/lib/heroes/types";
import { cn } from "@/lib/utils";

const tierBackgrounds: Record<HeroTier, string> = {
  S: "bg-tier-s",
  A: "bg-tier-a",
  B: "bg-tier-b",
  C: "bg-tier-c",
};

type TierBadgeProps = {
  tier: HeroTier;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "size-5 text-[10.5px] rounded-[4px]",
  md: "size-6 text-[12px] rounded-[5px]",
  lg: "size-8 text-[15px] rounded-[6px]",
};

export function TierBadge({ tier, size = "sm", className }: TierBadgeProps) {
  return (
    <span
      title={`Tier ${tier}`}
      className={cn(
        "inline-grid shrink-0 place-items-center font-bold text-page-background",
        tierBackgrounds[tier],
        sizes[size],
        className
      )}
    >
      {tier}
    </span>
  );
}
