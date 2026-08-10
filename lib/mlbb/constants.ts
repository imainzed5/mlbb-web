export const DEFAULT_LANGUAGE = "en";

export const DEFAULT_MLBB_API_BASE_URL = "https://mlbb.rone.dev/api";
export const DEFAULT_MLBB_API_FALLBACK_BASE_URLS = [
  "https://openmlbb.fastapicloud.dev/api",
] as const;

export const MLBB_API_BASE_URL =
  process.env.MLBB_API_BASE_URL?.trim() || DEFAULT_MLBB_API_BASE_URL;

export const MLBB_API_FALLBACK_BASE_URLS = (() => {
  const configuredFallbacks = (process.env.MLBB_API_FALLBACK_BASE_URLS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return configuredFallbacks.length > 0
    ? configuredFallbacks
    : [...DEFAULT_MLBB_API_FALLBACK_BASE_URLS];
})();

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
