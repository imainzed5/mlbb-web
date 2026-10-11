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

export function publicDataCacheControl(stale: boolean, revalidate: number) {
  return stale
    ? "no-store"
    : `public, max-age=0, s-maxage=${revalidate}, stale-while-revalidate=${STALE_WINDOWS.heroes}`;
}
