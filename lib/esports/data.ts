import { fetchMlbbPublicResource } from "@/lib/mlbb/client";
import { reportMlbbCollectionFailure } from "@/lib/mlbb/errors";
import { imageUrl, list, number, object, text } from "@/lib/mlbb/records";
import { readStandings } from "./standings";
export { readStandings } from "./standings";

export type League = "ph" | "id";
export const leagueName = { ph: "Philippines", id: "Indonesia" };
export function leagueValue(value: string): League | null { return value === "ph" || value === "id" ? value : null; }
export function matchIdentifier(league: League, value: unknown): string | null {
  const input = typeof value === "number" ? String(value) : text(value);
  return (league === "id" ? /^\d{1,12}$/ : /^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(input) && input.length <= 120 ? input : null;
}
function team(value: unknown) { const data = object(value); return { name: text(data.name) || "Unknown team", fullName: text(data.full_name), logo: imageUrl(data.logo) }; }
export function readSchedule(value: unknown, league: League) {
  const root = object(value); if (!Array.isArray(root.weeks)) throw new Error("Invalid schedule");
  return root.weeks.flatMap(rawWeek => {
    const week = object(rawWeek); const index = number(week.week);
    if (index === null || !Number.isInteger(index) || index < 1 || !Array.isArray(week.days)) throw new Error("Invalid week");
    return week.days.flatMap(rawDay => {
      const day = object(rawDay);
      if (!Array.isArray(day.matches)) throw new Error("Invalid schedule day");
      return day.matches.map(raw => {
      const match = object(raw); const start = text(match.start_at);
      return { week: index, id: matchIdentifier(league, match.match_id), start: start && Number.isFinite(Date.parse(start)) ? start : null,
        team1: team(match.team1), team2: team(match.team2), score1: number(match.score1), score2: number(match.score2) };
      });
    });
  });
}
export type ScheduledMatch = ReturnType<typeof readSchedule>[number];
function item(value: unknown) { const data = object(value); return { id: text(data.id) || String(number(data.id) ?? "unknown"), image: imageUrl(data.image), timelinePercent: number(data.timeline_percent) }; }
export function readMatch(value: unknown) {
  const root = object(value); if (!Array.isArray(root.games)) throw new Error("Invalid match detail");
  return root.games.map(raw => {
    const game = object(raw);
    if (!Array.isArray(game.teams)) throw new Error("Invalid match teams");
    return { number: number(game.number), duration: text(game.duration), teams: game.teams.map(rawTeam => {
      const data = object(rawTeam); const stats = object(data.stats);
      return { team: team(data.team), winner: typeof data.winner === "boolean" ? data.winner : null, kills: number(data.kills),
        stats: Object.entries(stats).flatMap(([label, value]) => number(value) === null ? [] : [{ label: label.replace(/_/g, " "), value: number(value)! }]),
        players: list(data.players).map(rawPlayer => {
          const player = object(rawPlayer); const hero = object(player.hero);
          return { name: text(player.name) || "Unknown player", hero: { name: text(hero.name) || "Unknown hero", image: imageUrl(hero.image) }, kills: number(player.kills), deaths: number(player.deaths), assists: number(player.assists), kda: number(player.kda),
            gold: number(player.gold), damage: number(player.damage_dealt), damageTaken: number(player.damage_taken), towerDamage: number(player.tower_damage), items: list(player.items).map(item), emblem: player.emblem ? item(player.emblem) : null, talents: list(player.talents).map(item), sequence: list(player.item_sequence).map(item) };
        }) };
    }) };
  });
}
export async function getLeagueData(league: League) {
  const load = async <T>(path: string, validate: (value: unknown) => T) => {
    try { return { available: true, value: await fetchMlbbPublicResource(path, validate, { revalidate: 300 }) }; }
    catch (error) { reportMlbbCollectionFailure(path, error); return { available: false, value: null }; }
  };
  const [schedule, standings] = await Promise.all([load(`/esports/${league}/schedule`, value => readSchedule(value, league)), load(`/esports/${league}/standings`, readStandings)]);
  return { schedule, standings, retrievedAt: new Date().toISOString() };
}
export async function getMatchData(league: League, id: string) {
  try { return await fetchMlbbPublicResource(`/esports/${league}/matches/${id}`, readMatch, { revalidate: 300 }); }
  catch (error) { reportMlbbCollectionFailure(`/esports/${league}/matches/${id}`, error); return null; }
}
export function manilaTime(value: string | null) { return value ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value)) : "Time unavailable"; }
