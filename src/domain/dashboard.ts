import type { ActivityLog, AxisScores, QuadrantKey } from "./types";
import { quadrantFromAxis, toPercent, pmToPercent } from "./mood";

export const DAY_MS = 24 * 60 * 60 * 1000;
/** Default smoothing window: a 3-day rolling position so the dot isn't jumpy. */
export const DEFAULT_WINDOW_DAYS = 3;

/** Reward contribution of a single log: blends valence with Pleasure & Mastery. */
export function rewardOf(log: ActivityLog): number {
  const v = toPercent(log.mood.valence);
  const p = pmToPercent(log.pleasure);
  const m = pmToPercent(log.mastery);
  return (v + p + m) / 3;
}

/** Stress contribution of a single log: driven by arousal. */
export function stressOf(log: ActivityLog): number {
  return toPercent(log.mood.arousal);
}

export interface DashboardState {
  hasData: boolean;
  axis: AxisScores;
  quadrant: QuadrantKey;
  /** Logs that fell inside the smoothing window. */
  sampleSize: number;
}

/**
 * Smoothed dashboard position from recent logs.
 * Recency-weighted mean over a rolling window (linear decay to the window edge),
 * so today counts most and stale days fade out.
 */
export function computeDashboard(
  logs: ActivityLog[],
  now: number = Date.now(),
  windowDays: number = DEFAULT_WINDOW_DAYS,
): DashboardState {
  const windowMs = windowDays * DAY_MS;
  let wReward = 0;
  let wStress = 0;
  let wSum = 0;
  let sample = 0;
  for (const log of logs) {
    const age = now - log.timestamp;
    if (age < 0 || age > windowMs) continue;
    const weight = 1 - age / windowMs; // 1 now → 0 at window edge
    wReward += rewardOf(log) * weight;
    wStress += stressOf(log) * weight;
    wSum += weight;
    sample += 1;
  }
  if (wSum === 0) {
    return {
      hasData: false,
      axis: { reward: 50, stress: 50 },
      quadrant: "numb",
      sampleSize: 0,
    };
  }
  const reward = Math.round(wReward / wSum);
  const stress = Math.round(wStress / wSum);
  return {
    hasData: true,
    axis: { reward, stress },
    quadrant: quadrantFromAxis(reward, stress),
    sampleSize: sample,
  };
}
