import type { HeroDetailRank, HeroTrendWindow } from "./types";

export const HERO_DETAIL_DEFAULT_RANK: HeroDetailRank = "all";
export const HERO_DETAIL_DEFAULT_TREND_WINDOW: HeroTrendWindow = 7;

export const HERO_DETAIL_RANK_OPTIONS: Array<{
  label: string;
  value: HeroDetailRank;
}> = [
  { label: "All ranks", value: "all" },
  { label: "Epic", value: "epic" },
  { label: "Legend", value: "legend" },
  { label: "Mythic", value: "mythic" },
  { label: "Honor", value: "honor" },
  { label: "Glory", value: "glory" },
];

export const HERO_DETAIL_TREND_WINDOW_OPTIONS: Array<{
  label: string;
  value: HeroTrendWindow;
}> = [
  { label: "7D", value: 7 },
  { label: "15D", value: 15 },
  { label: "30D", value: 30 },
];

export function normalizeHeroDetailRank(
  value: string | null | undefined
): HeroDetailRank {
  const normalized = value?.trim().toLowerCase();

  return HERO_DETAIL_RANK_OPTIONS.some((option) => option.value === normalized)
    ? (normalized as HeroDetailRank)
    : HERO_DETAIL_DEFAULT_RANK;
}

export function normalizeHeroTrendWindow(
  value: number | string | null | undefined
): HeroTrendWindow {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  return HERO_DETAIL_TREND_WINDOW_OPTIONS.some((option) => option.value === normalized)
    ? (normalized as HeroTrendWindow)
    : HERO_DETAIL_DEFAULT_TREND_WINDOW;
}