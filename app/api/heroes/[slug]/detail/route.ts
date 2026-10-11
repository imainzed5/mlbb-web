import { publicDataCacheControl, REVALIDATE_WINDOWS } from "@/lib/mlbb/cache";
import { getErrorMessage } from "@/lib/mlbb/errors";
import { getHeroPageData } from "@/lib/hero/getHeroPageData";
import { normalizeHeroDetailRank, normalizeHeroTrendWindow } from "@/lib/hero/constants";

type HeroDetailRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: HeroDetailRouteContext) {
  try {
    const { slug } = await context.params;
    const url = new URL(request.url);
    const rank = normalizeHeroDetailRank(url.searchParams.get("rank"));
    const trendWindow = normalizeHeroTrendWindow(url.searchParams.get("days"));
    const payload = await getHeroPageData(slug, { rank, trendWindow });

    if (!payload) {
      return Response.json(
        {
          message: "Hero detail was not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(payload, {
      headers: {
        "Cache-Control": publicDataCacheControl(payload.stale, REVALIDATE_WINDOWS.heroDetail),
      },
    });
  } catch (error) {
    return Response.json(
      {
        message: "Unable to load hero detail right now.",
        error: getErrorMessage(error),
      },
      {
        status: 500,
      }
    );
  }
}
