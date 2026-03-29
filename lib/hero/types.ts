import type {
  HeroBrowserItem,
  HeroLane,
  HeroRole,
  HeroTier,
} from "@/lib/heroes/types";

export type HeroCatalogItem = HeroBrowserItem;

export type HeroDetailRank =
  | "all"
  | "epic"
  | "legend"
  | "mythic"
  | "honor"
  | "glory";

export type HeroTrendWindow = 7 | 15 | 30;

export type HeroDetailFilters = {
  rank: HeroDetailRank;
  trendWindow: HeroTrendWindow;
};

export type RawHeroRelationTargetNode =
  | {
      data?: {
        head?: string | null;
      } | null;
    }
  | 0
  | ""
  | null
  | undefined;

export type RawHeroRelationBranch = {
  desc?: string | null;
  target_hero?: RawHeroRelationTargetNode[] | null;
  target_hero_id?: Array<number | 0 | null> | null;
};

export type RawHeroRelationGroup = {
  assist?: RawHeroRelationBranch | null;
  strong?: RawHeroRelationBranch | null;
  weak?: RawHeroRelationBranch | null;
};

export type RawHeroBattleSkillNode = {
  __data?: {
    skilldesc?: string | null;
    skilldescemblem?: string | null;
    skillicon?: string | null;
    skillname?: string | null;
  } | null;
};

export type RawHeroEmblemSkillNode = {
  emblemskill?: {
    skilldesc?: string | null;
    skilldescemblem?: string | null;
    skillicon?: string | null;
    skillname?: string | null;
  } | null;
  gifttiers?: number | null;
};

export type RawHeroRecommendedItem = {
  equipicon?: string | null;
  equipname?: string | null;
  equipskilldesc?: string | null;
  equiptips?: string | null;
  equiptypename?: string | null;
};

export type RawHeroRecommendedPlan = {
  battleskill?: RawHeroBattleSkillNode | null;
  description?: string | null;
  emblemplan?: {
    emblemplan?: {
      attriicon?: string | null;
      emblemattr?: {
        emblemattr?: string | null;
      } | null;
      emblemname?: string | null;
    } | null;
    giftid1?: RawHeroEmblemSkillNode | null;
    giftid2?: RawHeroEmblemSkillNode | null;
    giftid3?: RawHeroEmblemSkillNode | null;
  } | null;
  equiplist?: RawHeroRecommendedItem[] | null;
  face?: string | null;
  name?: string | null;
  title?: string | null;
};

export type RawHeroSkillIconNode = {
  data?: {
    skillicon?: string | null;
    skillid?: number | null;
  } | null;
};

export type RawHeroSkillComboRecord = {
  data?: {
    desc?: string | null;
    hero_id?: number | null;
    skill_id?: RawHeroSkillIconNode[] | null;
    title?: string | null;
  } | null;
};

export type RawHeroMatchupNode = {
  hero?: {
    data?: {
      head?: string | null;
    } | null;
  } | null;
  hero_appearance_rate?: number | null;
  hero_index?: number | null;
  hero_win_rate?: number | null;
  heroid?: number | null;
  increase_win_rate?: number | null;
};

export type RawHeroMatchupRecord = {
  data?: {
    main_heroid?: number | null;
    sub_hero?: RawHeroMatchupNode[] | null;
  } | null;
};

export type RawHeroTrendPointRecord = {
  app_rate?: number | null;
  ban_rate?: number | null;
  date?: string | null;
  win_rate?: number | null;
};

export type RawHeroTrendRecord = {
  data?: {
    win_rate?: RawHeroTrendPointRecord[] | null;
  } | null;
};

export type RawHeroDetailRecord = {
  data?: {
    head?: string | null;
    head_big?: string | null;
    hero?: {
      data?: {
        abilityshow?: Array<number | string | null> | null;
        difficulty?: number | string | null;
        head?: string | null;
        name?: string | null;
        painting?: string | null;
        recommendlevellabel?: string | null;
        recommendmasterplan?: RawHeroRecommendedPlan[] | null;
        smallmap?: string | null;
        speciality?: string | null;
        squarehead?: string | null;
        squareheadbig?: string | null;
        story?: string | null;
        tale?: string | null;
      } | null;
    } | null;
    hero_id?: number | null;
    relation?: RawHeroRelationGroup | null;
  } | null;
};

export type HeroReference = {
  heroId: number;
  image: string | null;
  name: string;
  primaryRole: HeroRole;
  slug: string;
  tier: HeroTier;
};

export type HeroAbilityMetric = {
  label: string;
  value: number;
};

export type HeroInsight = {
  description: string;
  heroes: HeroReference[];
  title: string;
};

export type HeroBuildItem = {
  icon: string | null;
  name: string;
  passiveText: string[];
  statText: string[];
  typeLabel: string | null;
};

export type HeroBuildTalent = {
  description: string | null;
  icon: string | null;
  name: string;
  tier: number | null;
};

export type HeroBuildPlan = {
  battleSpell:
    | {
        description: string | null;
        icon: string | null;
        name: string;
      }
    | null;
  creatorAvatar: string | null;
  creatorName: string | null;
  description: string | null;
  emblem:
    | {
        bonuses: string[];
        icon: string | null;
        name: string;
        talents: HeroBuildTalent[];
      }
    | null;
  items: HeroBuildItem[];
  title: string;
};

export type HeroCombo = {
  description: string | null;
  icons: Array<{
    icon: string | null;
    skillId: number;
  }>;
  title: string;
};

export type HeroMatchupEntry = HeroReference & {
  appearanceRate: number;
  deltaWinRate: number;
  heroWinRate: number;
};

export type HeroTrendPoint = {
  banRate: number;
  date: string;
  pickRate: number;
  winRate: number;
};

export type HeroOverview = {
  attributes: HeroAbilityMetric[];
  banRate: number;
  difficulty: number;
  heroId: number;
  image: string | null;
  insights: HeroInsight[];
  lanes: HeroLane[];
  name: string;
  painting: string | null;
  pickRate: number;
  portrait: string | null;
  primaryRole: HeroRole;
  roles: HeroRole[];
  skillPriority: string[];
  slug: string;
  specialties: string[];
  story: string | null;
  tier: HeroTier;
  winRate: number;
};

export type HeroPageData = {
  builds: HeroBuildPlan[];
  combos: HeroCombo[];
  counters: HeroMatchupEntry[];
  filters: HeroDetailFilters;
  generatedAt: string;
  overview: HeroOverview;
  stale: boolean;
  teammates: HeroMatchupEntry[];
  trends: HeroTrendPoint[];
};