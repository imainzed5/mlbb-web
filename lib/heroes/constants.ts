import type { HeroBrowserSort, HeroRole, HeroTier } from "./types";

export const HERO_ROLES: HeroRole[] = [
  "Fighter",
  "Mage",
  "Assassin",
  "Tank",
  "Support",
  "Marksman",
];

export const HERO_BROWSER_SORT_OPTIONS: Array<{
  value: HeroBrowserSort;
  label: string;
}> = [
  { value: "win-rate", label: "Win rate" },
  { value: "name", label: "Name A-Z" },
  { value: "pick-rate", label: "Pick rate" },
  { value: "tier", label: "Tier" },
];

export const HERO_TIER_ORDER: Record<HeroTier, number> = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
};

export const ROLE_BADGE_STYLES: Record<
  HeroRole,
  { background: string; text: string }
> = {
  Assassin: { background: "var(--role-assassin-bg)", text: "var(--role-assassin-text)" },
  Tank: { background: "var(--role-tank-bg)", text: "var(--role-tank-text)" },
  Mage: { background: "var(--role-mage-bg)", text: "var(--role-mage-text)" },
  Marksman: { background: "var(--role-marksman-bg)", text: "var(--role-marksman-text)" },
  Fighter: { background: "var(--role-fighter-bg)", text: "var(--role-fighter-text)" },
  Support: { background: "var(--role-support-bg)", text: "var(--role-support-text)" },
};