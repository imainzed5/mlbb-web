export const DEFAULT_LANGUAGE = "en";

export const MLBB_API_BASE_URL =
  process.env.MLBB_API_BASE_URL ?? "https://mlbb-stats.rone.dev/api";

export const MLBB_SUPPORTED_RANKS = [
  "all",
  "epic",
  "legend",
  "mythic",
  "honor",
  "glory",
] as const;

export const MLBB_SUPPORTED_TREND_WINDOWS = [7, 15, 30] as const;

export const MLBB_SUPPORTED_RANK_WINDOWS = [1, 3, 7, 15, 30] as const;

export const MLBB_SUPPORTED_LANES = [
  "exp",
  "mid",
  "roam",
  "jungle",
  "gold",
] as const;

export const HERO_BROWSER_PAGE_SIZE = 200;