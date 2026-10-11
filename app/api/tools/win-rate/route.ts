import { fetchMlbbPublicResource } from "@/lib/mlbb/client";
import { number, object } from "@/lib/mlbb/records";
import { calculateConsecutiveWins } from "@/lib/tools/win-rate";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  let result;
  const input = { matches: number(query.get("matches")) ?? NaN, current: number(query.get("current")) ?? NaN, target: number(query.get("target")) ?? NaN };
  try { result = calculateConsecutiveWins(input); }
  catch (error) { return Response.json({ message: error instanceof Error ? error.message : "Invalid input." }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
  if (result.reason === "reachable" && input.matches > 0) {
    try {
      const params = new URLSearchParams({ "match-now": String(input.matches), "wr-now": String(input.current), "wr-future": String(input.target) });
      const wins = await fetchMlbbPublicResource(`/addon/win-rate-calculator?${params}`, value => {
        const data = object(value); const wins = number(data.required_no_lose_matches);
        if (data.status !== "success" || wins === null || !Number.isSafeInteger(wins) || wins < 0) throw new Error("Invalid calculator result");
        return wins;
      });
      if (wins === result.wins) result.source = "provider";
    } catch { /* A verified local calculation remains available during outages. */ }
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
