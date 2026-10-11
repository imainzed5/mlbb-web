import { imageUrl, number, object, text } from "@/lib/mlbb/records";

export function readStandings(value: unknown) {
  const root = object(value); if (!Array.isArray(root.standings)) throw new Error("Invalid standings");
  const names = new Set<string>();
  return root.standings.map(raw => {
    const row = object(raw); const matches = object(row.match_wl); const games = object(row.game_wl); const team = object(row.team);
    const name = text(team.name);
    if (!name || names.has(name.toLowerCase())) throw new Error("Invalid standings team identity");
    names.add(name.toLowerCase());
    return { rank: number(row.rank), team: { name, fullName: text(team.full_name), logo: imageUrl(team.logo) }, points: number(row.match_point), wins: number(matches.win), losses: number(matches.lose), net: number(row.net_game_win), gameWins: number(games.win), gameLosses: number(games.lose) };
  });
}
