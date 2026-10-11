import { getErrorMessage } from "@/lib/mlbb/errors";
import { publicDataCacheControl, REVALIDATE_WINDOWS } from "@/lib/mlbb/cache";
import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";

export async function GET() {
  try {
    const payload = await getHeroBrowserData();

    return Response.json(payload, {
      headers: {
        "Cache-Control": publicDataCacheControl(payload.stale, REVALIDATE_WINDOWS.heroes),
      },
    });
  } catch (error) {
    return Response.json(
      {
        message: "Unable to load heroes right now.",
        error: getErrorMessage(error),
      },
      {
        status: 500,
      }
    );
  }
}
