import type { PlayerSession } from "@/lib/auth/session";

export type PlayerDashboardProfile = {
  avatar: string | null;
  historyRankLevel: string | null;
  level: number | null;
  name: string;
  rankLevel: string | null;
  regCountry: string | null;
  roleId: number;
  zoneId: number;
};

export type PlayerHeroHighlight = {
  heroId: number | null;
  image: string | null;
  label: string;
  name: string;
  value: string;
};

export type PlayerOverviewStats = {
  averageGameTime: number | null;
  averageScore: number | null;
  highlights: PlayerHeroHighlight[];
  mvpCount: number;
  totalMatches: number;
  totalWins: number;
  winRate: number | null;
  winStreak: number;
};

export type PlayerFrequentHero = {
  heroId: number;
  image: string | null;
  matches: number;
  name: string;
  power: number | null;
  winRate: number | null;
  wins: number;
};

export type PlayerRecentMatch = {
  assists: number;
  battleId: string;
  deaths: number;
  heroId: number | null;
  heroImage: string | null;
  heroName: string;
  isMvp: boolean;
  kills: number;
  laneLabel: string;
  playedAt: string | null;
  result: "Win" | "Loss";
  score: number | null;
  seasonId: number | null;
};

export type PlayerDashboardData = {
  frequentHeroes: PlayerFrequentHero[];
  matches: PlayerRecentMatch[];
  profile: PlayerDashboardProfile;
  seasonIds: number[];
  session: PlayerSession;
  stats: PlayerOverviewStats;
};

export type PlayerAuthLoginResult = {
  jwt: string;
  roleId: number;
  token: string | null;
  zoneId: number;
};