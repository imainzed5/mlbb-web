export type AcademyKind = "items" | "spells" | "emblems";
export type AcademyEntry = {
  id: string;
  kind: AcademyKind;
  name: string;
  image: string | null;
  category: string;
  description: string;
  attributes: string;
  tips: string;
};
export type AcademyCatalog = {
  entries: AcademyEntry[];
  partial: boolean;
  available: boolean;
  retrievedAt: string;
};
