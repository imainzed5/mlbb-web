import { getErrorMessage } from "@/lib/mlbb/errors";
import { REVALIDATE_WINDOWS, STALE_WINDOWS } from "@/lib/mlbb/cache";
import { getHeroBrowserData } from "@/lib/heroes/getHeroBrowserData";

export async function GET() {
  try {
    const payload = await getHeroBrowserData();

    return Response.json(payload, {
      headers: {
        "Cache-Control": `s-maxage=${REVALIDATE_WINDOWS.heroes}, stale-while-revalidate=${STALE_WINDOWS.heroes}`,
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