// The BA activity-scheduling loop: plan one small thing → predict how it'll
// feel → do it → compare forecast with reality. Depression systematically
// under-predicts reward; showing the gap in the user's own numbers is the
// most direct anti-anhedonia move the app can make.

import type { ActivityLog } from "./types";
import { DAY_MS } from "./dashboard";

/** One planned activity with its forecast. The app keeps at most one live plan. */
export interface ActivityPlan {
  id: string;
  activityLabel: string;
  /** Predicted enjoyment, 0–10 — the number reality gets compared against. */
  predictedPleasure: number;
  /** When the plan was made (epoch ms). */
  at: number;
}

export interface PlanOutcome {
  log: ActivityLog;
  predicted: number;
  actual: number;
  /** actual − predicted, in pleasure units. Positive = better than forecast. */
  delta: number;
}

/**
 * The most recent followed-through plan (a planned log carrying a forecast)
 * inside the window, or null. Drives the "forecast vs reality" read-back.
 */
export function recentPlanOutcome(
  logs: ActivityLog[],
  now: number = Date.now(),
  windowMs: number = DAY_MS,
): PlanOutcome | null {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (now - log.timestamp > windowMs) break;
    if (log.planned && log.anticipated !== undefined) {
      return {
        log,
        predicted: log.anticipated.pleasure,
        actual: log.pleasure,
        delta: log.pleasure - log.anticipated.pleasure,
      };
    }
  }
  return null;
}

/** Warm, relative description of when a plan was made. */
export function planAge(plan: ActivityPlan, now: number = Date.now()): string {
  const days = Math.floor((now - plan.at) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return "a few days ago";
}
