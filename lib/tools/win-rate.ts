export type WinRateInput = { matches: number; current: number; target: number };
export type WinRateResult = { wins: number | null; total: number; achieved: number; reason: "reachable" | "already-met" | "unreachable"; source: "local" | "provider" };

export function calculateConsecutiveWins(input: WinRateInput): WinRateResult {
  const { matches, current, target } = input;
  if (!Number.isSafeInteger(matches) || matches < 0 || matches > 1000000 ||
    !Number.isFinite(current) || current < 0 || current > 100 ||
    !Number.isFinite(target) || target <= 0 || target > 100 || (matches === 0 && current !== 0)) {
    throw new Error("Enter 0–1,000,000 matches, a current percentage from 0–100, and a target above 0 up to 100. With no matches, use 0% current win rate.");
  }
  if (matches > 0 && current >= target) return { wins: 0, total: matches, achieved: current, reason: "already-met", source: "local" };
  if (target === 100 && matches > 0 && current < 100) return { wins: null, total: matches, achieved: current, reason: "unreachable", source: "local" };
  const estimatedWins = matches * current / 100;
  const ratio = (wins: number) => (estimatedWins + wins) / (matches + wins) * 100;
  let wins = matches === 0 ? 1 : Math.max(0, Math.ceil(matches * (target - current) / (100 - target)));
  if (!Number.isSafeInteger(wins) || !Number.isSafeInteger(matches + wins)) throw new Error("This target requires too many wins to calculate precisely. Use a lower target percentage.");
  const reachesTarget = (count: number) => count * (100 - target) >= matches * (target - current);
  if (matches > 0) {
    while (wins > 0 && reachesTarget(wins - 1)) wins--;
    while (!reachesTarget(wins)) wins++;
  }
  return { wins, total: matches + wins, achieved: ratio(wins), reason: "reachable", source: "local" };
}
