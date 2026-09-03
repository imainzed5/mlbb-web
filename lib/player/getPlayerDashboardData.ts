import "server-only";

import type { PlayerSession } from "@/lib/auth/session";

import {
  fetchPlayerFrequentHeroes,
  fetchPlayerInfo,
  fetchPlayerRecentMatches,
  fetchPlayerSeasonIds,
  fetchPlayerStats,
} from "./api";
import type {
  PlayerDashboardData,
  PlayerDashboardProfile,
  PlayerFrequentHero,
  PlayerHeroHighlight,
  PlayerOverviewStats,
  PlayerRecentMatch,
} from "./types";

const LANE_LABELS: Record<number, string> = {
  1: "EXP",
  2: "Mid",
  3: "Roam",
  4: "Jungle",
  5: "Gold",
};

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toStringValue(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return typeof value === "number" && Number.isFinite(value) ? String(value) : null;
}

function toIntegerList(value: unknown) {
  return asArray(value)
    .map((entry) => toNumber(entry))
    .filter((entry): entry is number => entry !== null);
}

function getRecords(value: unknown) {
  const directArray = asArray(value);

  if (directArray.length > 0) {
    return directArray;
  }

  const objectValue = asObject(value);

  if (!objectValue) {
    return [];
  }

  if (asArray(objectValue.records).length > 0) {
    return asArray(objectValue.records);
  }

  if (asArray(objectValue.list).length > 0) {
    return asArray(objectValue.list);
  }

  if (asArray(objectValue.result).length > 0) {
    return asArray(objectValue.result);
  }

  if (asArray(objectValue.data).length > 0) {
    return asArray(objectValue.data);
  }

  return [];
}

function formatPercentage(value: number | null) {
  return value === null ? "No sample" : `${value.toFixed(1)}% WR`;
}

function normalizePlayerProfile(raw: unknown, session: PlayerSession): PlayerDashboardProfile {
  const data = asObject(raw);

  return {
    avatar: toStringValue(data?.avatar),
    historyRankLevel: toStringValue(data?.history_rank_level),
    level: toNumber(data?.level),
    name: toStringValue(data?.name) ?? `Player ${session.roleId}`,
    rankLevel: toStringValue(data?.rank_level),
    regCountry: toStringValue(data?.reg_country),
    roleId: toNumber(data?.roleId) ?? session.roleId,
    zoneId: toNumber(data?.zoneId) ?? session.zoneId,
  };
}

function normalizeHeroHighlight(
  label: string,
  raw: unknown,
  formatter: (value: number | null) => string
): PlayerHeroHighlight | null {
  const data = asObject(raw);
  const heroName = toStringValue(data?.n);

  if (!heroName) {
    return null;
  }

  return {
    heroId: toNumber(data?.hid),
    image: toStringValue(data?.ix) ?? toStringValue(data?.i2x),
    label,
    name: heroName,
    value: formatter(
      toNumber(data?.v) ??
        toNumber(data?.value) ??
        toNumber(data?.score) ??
        toNumber(data?.mr)
    ),
  };
}

function normalizePlayerStats(raw: unknown): PlayerOverviewStats {
  const data = asObject(raw);
  const totalMatches = toNumber(data?.tc) ?? 0;
  const totalWins = toNumber(data?.wc) ?? 0;
  const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : null;
  const highlights = [
    normalizeHeroHighlight("Most played", data?.mo, formatPercentage),
    normalizeHeroHighlight("Highest kills", data?.hk, formatPercentage),
    normalizeHeroHighlight("Most assists", data?.ma, formatPercentage),
    normalizeHeroHighlight("Most damage", data?.mtd, formatPercentage),
  ].filter((entry): entry is PlayerHeroHighlight => entry !== null);

  return {
    averageGameTime: toNumber(data?.gt),
    averageScore: toNumber(data?.as),
    highlights,
    mvpCount: toNumber(data?.mvpc) ?? 0,
    totalMatches,
    totalWins,
    winRate,
    winStreak: toNumber(data?.wsc) ?? 0,
  };
}

function normalizeFrequentHeroes(raw: unknown): PlayerFrequentHero[] {
  return getRecords(raw)
    .map((entry) => asObject(entry))
    .filter((entry): entry is Record<string, unknown> => entry !== null)
    .map((entry) => {
      const heroEntity = asObject(entry.hid_e);
      const matches = toNumber(entry.tc) ?? 0;
      const wins = toNumber(entry.wc) ?? 0;

      return {
        heroId: toNumber(entry.hid) ?? 0,
        image: toStringValue(heroEntity?.ix) ?? toStringValue(heroEntity?.i2x),
        matches,
        name: toStringValue(heroEntity?.n) ?? "Unknown hero",
        power: toNumber(entry.p),
        winRate: matches > 0 ? (wins / matches) * 100 : null,
        wins,
      } satisfies PlayerFrequentHero;
    })
    .filter((hero) => hero.heroId > 0);
}

function normalizeRecentMatches(raw: unknown): PlayerRecentMatch[] {
  return getRecords(raw)
    .map((entry) => asObject(entry))
    .filter((entry): entry is Record<string, unknown> => entry !== null)
    .map((entry) => {
      const heroEntity = asObject(entry.hid_e);
      const laneId = toNumber(entry.lid);
      const timestamp = toNumber(entry.ts);

      return {
        assists: toNumber(entry.a) ?? 0,
        battleId: String(entry.bid_s ?? entry.bid ?? "unknown"),
        deaths: toNumber(entry.d) ?? 0,
        heroId: toNumber(entry.hid),
        heroImage: toStringValue(heroEntity?.ix) ?? toStringValue(heroEntity?.i2x),
        heroName: toStringValue(heroEntity?.n) ?? "Unknown hero",
        isMvp: (toNumber(entry.mvp) ?? 0) === 1,
        kills: toNumber(entry.k) ?? 0,
        laneLabel: laneId ? LANE_LABELS[laneId] ?? "Unknown" : "Unknown",
        playedAt: timestamp ? new Date(timestamp * 1000).toISOString() : null,
        result: (toNumber(entry.res) ?? 0) === 1 ? "Win" : "Loss",
        score: toNumber(entry.s),
        seasonId: toNumber(entry.sid),
      } satisfies PlayerRecentMatch;
    });
}

export async function getPlayerDashboardData(
  session: PlayerSession
): Promise<PlayerDashboardData> {
  const [profileRaw, statsRaw, seasonRaw] = await Promise.all([
    fetchPlayerInfo(session.jwt),
    fetchPlayerStats(session.jwt),
    fetchPlayerSeasonIds(session.jwt),
  ]);
  const seasonIds = toIntegerList(asObject(seasonRaw)?.sids ?? seasonRaw);
  const activeSeasonId = seasonIds[0];
  const [frequentRaw, matchesRaw] = activeSeasonId
    ? await Promise.all([
        fetchPlayerFrequentHeroes(session.jwt, { seasonId: activeSeasonId }),
        fetchPlayerRecentMatches(session.jwt, { seasonId: activeSeasonId }),
      ])
    : [null, null];

  return {
    frequentHeroes: normalizeFrequentHeroes(frequentRaw),
    matches: normalizeRecentMatches(matchesRaw),
    profile: normalizePlayerProfile(profileRaw, session),
    seasonIds,
    session,
    stats: normalizePlayerStats(statsRaw),
  };
}
