import { getAcademyCatalog } from "@/lib/academy/catalog";
import { catalogKind, findCatalogEntry } from "@/lib/academy/normalizers";
import { publicDataCacheControl } from "@/lib/mlbb/cache";

export async function GET(request: Request, context: { params: Promise<{ kind: string }> }) {
  const kind = catalogKind((await context.params).kind);
  const noStore = { "Cache-Control": "no-store" };
  if (!kind) return Response.json({ message: "Unknown catalog." }, { status: 404, headers: noStore });
  const query = new URL(request.url).searchParams;
  const name = query.get("name"); const id = query.get("id");
  if ((name?.length ?? 0) > 100 || (id?.length ?? 0) > 40) return Response.json({ message: "Invalid reference." }, { status: 400, headers: noStore });
  const catalog = await getAcademyCatalog(kind);
  if (!catalog.available) return Response.json({ message: "The catalog is temporarily unavailable." }, { status: 503, headers: noStore });
  return Response.json(name || id ? { entry: findCatalogEntry(catalog.entries, name ?? "", id) } : catalog,
    { headers: { "Cache-Control": publicDataCacheControl(catalog.partial || !catalog.available, 21600) } });
}
