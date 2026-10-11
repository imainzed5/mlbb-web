import { cache } from "react";
import { getCompletePublicCollection } from "@/lib/mlbb/public-data";
import { reportMlbbCollectionFailure } from "@/lib/mlbb/errors";
import { normalizeAcademyEntries } from "./normalizers";
import type { AcademyCatalog, AcademyKind } from "./types";

export const getAcademyCatalog = cache(async (kind: AcademyKind): Promise<AcademyCatalog> => {
  const paths = kind === "items" ? ["/academy/equipment/expanded"] :
    kind === "spells" ? ["/academy/spells"] : ["/academy/emblems", "/academy/roles"];
  const results = await Promise.all(paths.map(async path => {
    try { return { ...(await getCompletePublicCollection(`${path}?lang=en`)), available: true }; }
    catch (error) {
      reportMlbbCollectionFailure(path, error);
      return { records: [], partial: true, available: false };
    }
  }));
  return {
    entries: normalizeAcademyEntries(kind, results.flatMap(r => r.records)),
    partial: results.some(r => r.partial), available: results.some(r => r.available),
    retrievedAt: new Date().toISOString(),
  };
});
