import { fetchMlbbPublicResource } from "@/lib/mlbb/client";
import { readSimulation, type ScenarioInput } from "./scenarios";
import type { League } from "./data";

export async function runSimulation(kind: League | "custom", input: ScenarioInput) {
  return fetchMlbbPublicResource(kind === "custom" ? "/esports/standings/calculate" : `/esports/${kind}/standings/simulate`, readSimulation, { body: input });
}
