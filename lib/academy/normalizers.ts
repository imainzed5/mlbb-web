import { imageUrl, list, number, object, text } from "@/lib/mlbb/records";
import type { AcademyEntry, AcademyKind } from "./types";

export function normalizeAcademyEntries(kind: AcademyKind, records: unknown[]): AcademyEntry[] {
  const entries: AcademyEntry[] = [];
  for (const record of records) {
    const data = object(object(record).data);
    let entry: AcademyEntry | null = null;
    if (kind === "items") {
      const id = number(data.equipid);
      if (id !== null && text(data.equipname)) entry = {
        id: String(id), kind, name: text(data.equipname), image: imageUrl(data.equipicon),
        category: text(data.equiptypename) || "Other", attributes: text(data.equiptips),
        description: text(data.equipskilldesc) || [1,2,3,4,5,6,7].map(i => text(data[`equipskill${i}`])).filter(Boolean).join("\n"),
        tips: "",
      };
    } else if (kind === "spells") {
      const id = number(data.battleskillid);
      const skill = object(data.__data);
      const directName = text(data.skillname);
      const name = text(skill.skillname) || (directName.startsWith("@") ? "" : directName);
      if (id !== null && name) entry = {
        id: String(id), kind, name, image: imageUrl(skill.skillicon) ?? imageUrl(data.skillicon),
        category: "Battle spell", attributes: text(data.skillshortdesc),
        description: text(skill.skilldesc), tips: "",
      };
    } else if (data.emblemskill) {
      const talent = object(data.emblemskill);
      const id = number(data.giftid);
      if (id !== null && text(talent.skillname)) entry = {
        id: `talent-${id}`, kind, name: text(talent.skillname), image: imageUrl(talent.skillicon),
        category: `Talent tier ${number(data.gifttiers) ?? "unknown"}`,
        // numdescribe is a positional substitution list, not labeled attributes.
        // The resolved description already gives those values their meaning.
        description: text(talent.skilldesc), attributes: "", tips: "",
      };
    } else {
      const emblem = object(object(data.emblem_detail).data);
      const id = number(data.emblem_id);
      if (id !== null && text(data.emblem_title)) entry = {
        id: `family-${id}`, kind, name: `${text(data.emblem_title)} emblem`,
        image: imageUrl(emblem.attriicon) ?? imageUrl(data.emblem_icon), category: "Emblem family",
        description: "Base emblem attributes. Choose talents separately according to their available tiers.",
        attributes: text(object(emblem.emblemattr).emblemattr), tips: "",
      };
    }
    if (entry) entries.push(entry);
  }
  return [...new Map(entries.map(e => [e.id, e])).values()].sort((a,b) => a.name.localeCompare(b.name));
}

export function findCatalogEntry(entries: AcademyEntry[], name: string, id?: string | null) {
  if (id) {
    const exact = entries.find(e => e.id === id);
    if (exact) return exact;
  }
  const matches = entries.filter(e => e.name.toLowerCase() === name.trim().toLowerCase() ||
    (e.id.startsWith("family-") && e.name.toLowerCase() === `${name.trim().toLowerCase()} emblem`));
  return matches.length === 1 ? matches[0] : null;
}

export function catalogKind(value: string): AcademyKind | null {
  return ["items", "spells", "emblems"].includes(value) ? value as AcademyKind : null;
}

export function unwrapLaneRecords(records: unknown[]): string[] {
  const lanes = records.flatMap(r => list(object(object(object(object(r).data).hero).data).roadsort))
    .map(r => text(object(object(r).data).road_sort_title).toLowerCase().replace(/\s+lane$/, ""));
  return [...new Set(lanes)].filter(l => ["exp", "mid", "gold", "jungle", "roam"].includes(l));
}
