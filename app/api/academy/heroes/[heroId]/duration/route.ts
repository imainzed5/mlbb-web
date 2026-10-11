import { getPublicCollection } from "@/lib/mlbb/public-data";
import { unwrapLaneRecords } from "@/lib/academy/normalizers";
import { normalizeDuration } from "@/lib/academy/duration";
import { HERO_DETAIL_RANK_OPTIONS } from "@/lib/hero/constants";
import { reportMlbbCollectionFailure } from "@/lib/mlbb/errors";

export async function GET(request: Request, context: { params: Promise<{ heroId: string }> }) {
  const { heroId } = await context.params;
  const query = new URL(request.url).searchParams;
  const rank = query.get("rank") ?? "all"; const requestedLane = query.get("lane");
  if (!/^\d{1,4}$/.test(heroId) || !HERO_DETAIL_RANK_OPTIONS.some(option => option.value === rank) || (requestedLane && !["exp", "mid", "gold", "jungle", "roam"].includes(requestedLane))) return Response.json({ message: "Invalid duration filters." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    const laneData = await getPublicCollection(`/academy/heroes/${heroId}/lane?lang=en`, 3600);
    const lanes = unwrapLaneRecords(laneData.records);
    const lane = requestedLane || lanes[0];
    if (!lane || !lanes.includes(lane)) return Response.json({ lanes, lane: null, data: null }, { headers: { "Cache-Control": "no-store" } });
    const timeline = await getPublicCollection(`/academy/heroes/${heroId}/win-rate/timeline?lane=${lane}&rank=${rank}&lang=en`, 3600);
    const data = normalizeDuration(timeline.records, Number(heroId));
    return Response.json({ lanes, lane, data, retrievedAt: new Date().toISOString() }, { headers: { "Cache-Control": data ? "public, s-maxage=3600, stale-while-revalidate=60" : "no-store" } });
  } catch (error) {
    reportMlbbCollectionFailure(`/academy/heroes/${heroId}/win-rate/timeline`, error);
    return Response.json({ message: "Duration statistics are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
