export type DataRecord = Record<string, unknown>;

export function object(value: unknown): DataRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as DataRecord : {};
}

export function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function text(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').trim();
}

export function number(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function imageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
  } catch { return null; }
}

export function percent(value: unknown): number | null {
  const parsed = number(value);
  return parsed !== null && parsed >= 0 && parsed <= 1 ? parsed * 100 : null;
}

export type PublicCollection = { records: unknown[]; total: number | null };
export function readCollection(payload: unknown): PublicCollection {
  const root = object(payload);
  const data = object(root.data);
  if (root.code !== 0 || !Array.isArray(data.records)) throw new Error("Invalid collection response");
  const total = number(data.total);
  if (total !== null && (!Number.isInteger(total) || total < 0)) throw new Error("Invalid collection total");
  return { records: data.records, total };
}
