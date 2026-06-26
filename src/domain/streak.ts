import type { ActivityLog } from "./types";
import { DAY_MS } from "./dashboard";

/** Local-day index (days since epoch in local time) for a timestamp. */
export function dayIndex(ts: number, now: number = ts): number {
  const d = new Date(ts);
  // Normalize to local midnight, then count days.
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  void now;
  return Math.floor(localMidnight / DAY_MS);
}

export type StreakStatus = "new" | "active" | "welcome-back";

export interface StreakState {
  days: number;
  status: StreakStatus;
  /** True when a single missed day was forgiven inside the current run. */
  graceUsed: boolean;
}

/**
 * Forgiving streak: counts distinct logged days ending today or yesterday.
 * A single missed day inside the run is forgiven (grace) — never punished.
 * Two or more consecutive missed days ends the run, and we greet a return warmly.
 */
export function computeStreak(
  logs: ActivityLog[],
  now: number = Date.now(),
): StreakState {
  if (logs.length === 0) return { days: 0, status: "new", graceUsed: false };

  const today = dayIndex(now);
  const loggedDays = new Set(logs.map((l) => dayIndex(l.timestamp)));
  const sorted = [...loggedDays].sort((a, b) => b - a);
  const mostRecent = sorted[0];

  // If the last log was 2+ full days ago, the run is over → welcome back.
  if (today - mostRecent >= 2) {
    return { days: 0, status: "welcome-back", graceUsed: false };
  }

  // Walk backwards from the most recent logged day, forgiving one gap.
  let days = 0;
  let graceUsed = false;
  let cursor = mostRecent;
  while (loggedDays.has(cursor) || (!graceUsed && loggedDays.has(cursor - 1))) {
    if (loggedDays.has(cursor)) {
      days += 1;
      cursor -= 1;
    } else {
      // single gap: forgive once and continue
      graceUsed = true;
      cursor -= 1;
    }
  }
  return { days, status: "active", graceUsed };
}
