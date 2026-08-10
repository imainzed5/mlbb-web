export type HeroRole =
  | "Fighter"
  | "Mage"
  | "Assassin"
  | "Tank"
  | "Support"
  | "Marksman";

export type HeroLane = "exp" | "mid" | "roam" | "jungle" | "gold";

export type HeroTier = "S" | "A" | "B" | "C";

export type HeroBrowserSort = "win-rate" | "name" | "pick-rate" | "tier";

export type HeroBrowserItem = {
  heroId: number;
  slug: string;
  name: string;
  image: string | null;
  smallmap: string | null;
  roles: HeroRole[];
  primaryRole: HeroRole;
  lanes: HeroLane[];
  winRate: number;
  pickRate: number;
  banRate: number;
  tier: HeroTier;
  tierOrder: number;
};

export type HeroBrowserSummary = {
  totalHeroes: number;
  fightersCount: number;
  magesCount: number;
  highestWinRateHero:
    | {
        name: string;
        slug: string;
        winRate: number;
      }
    | null;
};

export type HeroBrowserPayload = {
  heroes: HeroBrowserItem[];
  summary: HeroBrowserSummary;
  generatedAt: string;
  stale: boolean;
  source: "live" | "partial" | "snapshot";
  snapshotAt: string | null;
};
