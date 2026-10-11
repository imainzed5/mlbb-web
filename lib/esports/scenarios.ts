import { number, object, text } from "@/lib/mlbb/records";
import { readStandings } from "./standings";

export type ScenarioResult = { week: number; team1: string; team2: string; score1: number | null; score2: number | null };
export type ScenarioInput = { teams?: string[]; eliminated?: number; results: ScenarioResult[]; model: "form" | "even"; simulations?: number };
export type ScenarioMatch = ScenarioResult & { state: string };
export type Simulation = {
  teams: number; playoffSpots: number; played: number; remaining: number; edited: number; model: "form" | "even"; samples: number;
  matches: ScenarioMatch[];
  standings: Array<ReturnType<typeof readStandings>[number] & { status: "clinched" | "alive" | "eliminated"; probability: number; tiebreak: string | null }>;
};
const integer = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
function teamName(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 40 || /[\u0000-\u001f]/.test(value)) throw new Error("Team names must contain 1–40 characters.");
  return value.trim();
}
export function matchKey(match: Pick<ScenarioResult, "week" | "team1" | "team2">) { return JSON.stringify([match.week, ...[match.team1, match.team2].sort()]); }
export function validateScenario(value: unknown, custom: boolean, allowed?: ScenarioMatch[]): ScenarioInput {
  const data = object(value);
  let teams: string[] | undefined;
  if (custom) {
    if (!Array.isArray(data.teams) || data.teams.length < 2 || data.teams.length > 20) throw new Error("Enter 2–20 team names.");
    teams = data.teams.map(teamName);
    if (new Set(teams.map(team => team.toLowerCase())).size !== teams.length) throw new Error("Team names must be unique.");
  }
  if (data.eliminated !== undefined && !integer(data.eliminated, 0, (teams?.length ?? 20)-1)) throw new Error("The eliminated team count must leave at least one playoff spot.");
  const model = data.model ?? "form";
  if (model !== "form" && model !== "even") throw new Error("Select the form or even probability model.");
  if (data.simulations !== undefined && !integer(data.simulations, 100, 20000)) throw new Error("Simulation count must be 100–20,000.");
  if (!Array.isArray(data.results) || data.results.length > 400) throw new Error("At most 400 match edits are supported.");
  const keys = new Set<string>();
  const results = data.results.map(value => {
    const row = object(value);
    if (!integer(row.week, 1, 100)) throw new Error("Match week must be 1–100.");
    const team1 = teamName(row.team1); const team2 = teamName(row.team2);
    if (team1.toLowerCase() === team2.toLowerCase()) throw new Error("A team cannot play itself.");
    if (teams && (!teams.includes(team1) || !teams.includes(team2))) throw new Error("Match teams must belong to this league.");
    const score1 = row.score1 ?? null; const score2 = row.score2 ?? null;
    if (!(score1 === null && score2 === null) && !(integer(score1,0,2) && integer(score2,0,2) && ((score1 === 2 && score2 !== 2) || (score2 === 2 && score1 !== 2)))) throw new Error("Use 2–0, 2–1, 1–2, 0–2, or clear both scores.");
    const match = { week: row.week as number, team1, team2, score1: score1 as number | null, score2: score2 as number | null };
    const key = matchKey(match);
    if (keys.has(key)) throw new Error("Duplicate match edits are not allowed.");
    keys.add(key);
    if (allowed && !allowed.some(known => matchKey(known) === key)) throw new Error("This match is not in the selected league schedule.");
    return match;
  });
  return { ...(teams ? { teams } : {}), ...(data.eliminated !== undefined ? { eliminated: data.eliminated as number } : {}), results, model, ...(data.simulations !== undefined ? { simulations: data.simulations as number } : {}) };
}
export function readSimulation(value: unknown): Simulation {
  const data = object(value);
  for (const field of ["teams", "playoff_spots", "matches_played", "matches_remaining", "edited_matches", "probability_simulations"]) if (!integer(data[field],0,100000)) throw new Error("Invalid simulation metadata");
  if (!Array.isArray(data.weeks) || !Array.isArray(data.standings) || !["form", "even"].includes(String(data.probability_model))) throw new Error("Invalid simulation response");
  const matches = data.weeks.flatMap(value => {
    const week = object(value); if (!Array.isArray(week.matches) || !integer(week.week,1,100)) throw new Error("Invalid simulation week");
    return week.matches.map(value => {
      const row = object(value);
      const validated = validateScenario({ results: [{ week: week.week, team1: object(row.team1).name, team2: object(row.team2).name, score1: row.score1, score2: row.score2 }] }, false).results[0];
      return { ...validated, state: text(row.state) };
    });
  });
  const standings = readStandings(data).map((row,index) => {
    const raw = object((data.standings as unknown[])[index]); const probability = number(raw.playoff_probability); const status = raw.status;
    if (probability === null || probability < 0 || probability > 100 || !["clinched", "alive", "eliminated"].includes(String(status))) throw new Error("Invalid playoff probability");
    return { ...row, status: status as "clinched" | "alive" | "eliminated", probability, tiebreak: text(raw.tiebreak) || null };
  });
  return { teams: data.teams as number, playoffSpots: data.playoff_spots as number, played: data.matches_played as number, remaining: data.matches_remaining as number, edited: data.edited_matches as number, model: data.probability_model as "form" | "even", samples: data.probability_simulations as number, matches, standings };
}
export function importScenario(value: unknown, kind: "ph" | "id" | "custom") {
  const data = object(value);
  if (data.version !== 1 || data.kind !== kind) throw new Error("Select a version 1 scenario for this league/tool.");
  return validateScenario(data.input, kind === "custom");
}
