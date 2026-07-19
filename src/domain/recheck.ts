// PHQ-9 re-check scheduling — the outcome measure only means something if it's
// repeated. Standard interval for symptom tracking is ~2 weeks.

import type { PHQ9Result } from "./types";
import { DAY_MS } from "./dashboard";

export const RECHECK_INTERVAL_DAYS = 14;

/** When the next re-check is due, based on the most recent completed check-in. */
export function nextRecheckAt(history: PHQ9Result[]): number | null {
  if (history.length === 0) return null;
  const last = history[history.length - 1];
  return last.at + RECHECK_INTERVAL_DAYS * DAY_MS;
}

/** True once the interval since the last check-in has elapsed. */
export function isRecheckDue(
  history: PHQ9Result[],
  now: number = Date.now(),
): boolean {
  const due = nextRecheckAt(history);
  return due !== null && now >= due;
}
