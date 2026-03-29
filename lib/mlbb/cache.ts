export const REVALIDATE_WINDOWS = {
  landing: 3600,
  heroes: 3600,
  heroDetail: 21600,
  heroRank: 3600,
  meta: 3600,
} as const;

export const STALE_WINDOWS = {
  heroes: 86400,
} as const;