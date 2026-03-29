import type { NextRequest } from "next/server";

import { normalizeHeroDetailRank } from "@/lib/hero/constants";
import { REVALIDATE_WINDOWS, STALE_WINDOWS } from "@/lib/mlbb/cache";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { getMetaDashboardData } from "@/lib/meta/getMetaDashboardData";
import { normalizeMetaLane, normalizeMetaRole } from "@/lib/meta/dashboard";

export async function GET(request: NextRequest) {
  try {
    const lane = normalizeMetaLane(request.nextUrl.searchParams.get("lane"));
    const role = normalizeMetaRole(request.nextUrl.searchParams.get("role"));
    const rank = normalizeHeroDetailRank(request.nextUrl.searchParams.get("rank"));
    const payload = await getMetaDashboardData({ lane, rank, role });

    return Response.json(payload, {
      headers: {
        "Cache-Control": `s-maxage=${REVALIDATE_WINDOWS.meta}, stale-while-revalidate=${STALE_WINDOWS.heroes}`,
      },
    });
  } catch (error) {
    return Response.json(
      {
        message: "Unable to load the meta dashboard right now.",
        error: getErrorMessage(error),
      },
      {
        status: 500,
      }
    );
  }
}