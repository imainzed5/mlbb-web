import { fetchMlbbPublicResource } from "./client";
import { object, readCollection } from "./records";

export async function getPublicCollection(path: string, revalidate = 21600) {
  return fetchMlbbPublicResource(path, readCollection, { revalidate });
}

export async function getCompletePublicCollection(path: string, revalidate = 21600) {
  const records: unknown[] = [];
  const url = new URL(path, "https://collection.local");
  const size = 100;
  let total: number | null = null;
  const seen = new Set<string>();
  for (let index = 1; index <= 10; index++) {
    url.searchParams.set("size", String(size));
    url.searchParams.set("index", String(index));
    let page;
    try {
      page = await getPublicCollection(`${url.pathname}${url.search}`, revalidate);
    } catch (error) {
      if (records.length) return { records, partial: true };
      throw error;
    }
    total = page.total ?? total;
    const before = records.length;
    for (const record of page.records) {
      const identity = object(record);
      const fingerprint = identity._id !== undefined ? `id:${String(identity._id)}` : identity.id !== undefined ? `id:${String(identity.id)}` : JSON.stringify(record);
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        records.push(record);
      }
    }
    if (total !== null && records.length >= total) return { records, partial: false };
    if (!page.records.length || records.length === before || (total === null && page.records.length < size)) {
      return { records, partial: (total !== null && records.length < total) || (page.records.length > 0 && records.length === before) };
    }
  }
  return { records, partial: true };
}
