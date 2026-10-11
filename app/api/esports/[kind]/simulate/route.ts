import { leagueValue } from "@/lib/esports/data";
import { validateScenario } from "@/lib/esports/scenarios";
import { runSimulation } from "@/lib/esports/simulation";
import { reportMlbbCollectionFailure } from "@/lib/mlbb/errors";
import { BodyTooLargeError, readScenarioBody } from "@/lib/mlbb/request-body";

export async function POST(request: Request, context: { params: Promise<{ kind: string }> }) {
  const rawKind = (await context.params).kind;
  const kind = rawKind === "custom" ? "custom" : leagueValue(rawKind);
  const headers = { "Cache-Control": "no-store" };
  if (!kind) return Response.json({ message: "Unknown league." }, { status: 404, headers });
  let input;
  try {
    input = validateScenario(await readScenarioBody(request), kind === "custom");
  } catch (error) { return Response.json({ message: error instanceof Error ? error.message : "Invalid scenario." }, { status: error instanceof BodyTooLargeError ? 413 : 400, headers }); }
  try {
    if (input.results.length || (kind !== "custom" && input.eliminated !== undefined)) {
      const baseline = await runSimulation(kind, { ...(kind === "custom" ? input : {}), results: [], model: "form", simulations: 100 });
      try { input = validateScenario(input, kind === "custom", baseline.matches); }
      catch (error) { return Response.json({ message: error instanceof Error ? error.message : "Invalid match edit." }, { status: 400, headers }); }
      if (input.eliminated !== undefined && input.eliminated >= baseline.teams) return Response.json({ message: "Leave at least one playoff spot." }, { status: 400, headers });
    }
    return Response.json(await runSimulation(kind, input), { headers });
  } catch (error) {
    reportMlbbCollectionFailure(`/esports/${kind}/standings/simulate`, error);
    return Response.json({ message: "The scenario service is temporarily unavailable. Your edits are preserved; retry shortly." }, { status: 503, headers });
  }
}
