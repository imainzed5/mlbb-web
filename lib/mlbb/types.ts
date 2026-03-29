export type MlbbCollectionResponse<RecordType> = {
  code: number;
  message: string;
  data: {
    records: RecordType[];
    total?: number;
  };
};

export type MlbbMutationResponse<DataType> = {
  code: number;
  data: DataType;
  message?: string;
  msg?: string;
};

export type RawHeroListRecord = {
  data?: {
    hero_id?: number;
    hero?: {
      data?: {
        head?: string | null;
        name?: string | null;
        smallmap?: string | null;
      } | null;
    } | null;
  } | null;
};

export type RawHeroRoleNode =
  | {
      data?: {
        sort_title?: string | null;
      } | null;
    }
  | ""
  | null
  | undefined;

export type RawHeroLaneNode =
  | {
      data?: {
        road_sort_title?: string | null;
      } | null;
    }
  | ""
  | null
  | undefined;

export type RawHeroPositionsRecord = {
  data?: {
    hero_id?: number;
    hero?: {
      data?: {
        name?: string | null;
        smallmap?: string | null;
        sortid?: RawHeroRoleNode[] | null;
        roadsort?: RawHeroLaneNode[] | null;
      } | null;
    } | null;
  } | null;
};

export type RawHeroRankRecord = {
  data?: {
    main_heroid?: number;
    main_hero?: {
      data?: {
        head?: string | null;
        name?: string | null;
      } | null;
    } | null;
    main_hero_appearance_rate?: number | null;
    main_hero_ban_rate?: number | null;
    main_hero_win_rate?: number | null;
  } | null;
};