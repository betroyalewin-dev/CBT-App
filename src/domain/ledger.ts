// The activity ledger — the BA answer the whole app exists to compute:
// which activities give this person the most back for the least it takes
// out of them. Per-activity return vs the user's own baseline, discounted
// by rated effort when we have it.

import type { ActivityLog } from "./types";
import { rewardOf, DAY_MS } from "./dashboard";

/** The default non-activity label — a pure check-in, never a "best bet". */
export const MOOD_CHECK_LABEL = "Mood check";

/** How far back the ledger looks: recent life, not ancient history. */
export const LEDGER_WINDOW_DAYS = 28;

/** Minimum logs of one activity before we'll say anything about it. */
export const MIN_ACTIVITY_LOGS = 2;

/**
 * How far an activity's blended return must sit above the user's baseline
 * (0–100 scale) before we call it a bet worth naming.
 */
const BET_MARGIN = 3;

/** Points of "worth" one step of effort costs: heavy (3) loses 15 vs light (1). */
const EFFORT_DISCOUNT = 7.5;

export type EffortWord = "light" | "medium" | "heavy";

export function effortWord(avgEffort: number): EffortWord {
  if (avgEffort < 1.5) return "light";
  if (avgEffort < 2.5) return "medium";
  return "heavy";
}

export interface ActivityStat {
  label: string;
  n: number;
  /** Mean blended return (valence + pleasure + mastery, 0–100 — same blend as the dashboard). */
  benefit: number;
  /** Mean valence vs the user's overall baseline, in mood units (−10…+10). */
  moodLift: number;
  avgPleasure: number;
  avgMastery: number;
  /** Mean rated effort 1–3, or null when no log of this activity was rated. */
  avgEffort: number | null;
  /** benefit discounted by effort — the ranking score. */
  worth: number;
}

export interface Ledger {
  /** The user's mean blended return across every windowed log — "your usual". */
  baseline: number;
  stats: ActivityStat[];
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Per-activity aggregates over the recent window, sorted by worth.
 * Mood checks count toward the baseline (they're honest samples of "usual")
 * but never appear as activities themselves.
 */
export function activityLedger(
  logs: ActivityLog[],
  now: number = Date.now(),
  windowDays: number = LEDGER_WINDOW_DAYS,
): Ledger {
  const cutoff = now - windowDays * DAY_MS;
  const recent = logs.filter((l) => l.timestamp >= cutoff && l.timestamp <= now);
  const baseline = mean(recent.map(rewardOf));
  const baselineValence = mean(recent.map((l) => l.mood.valence));

  const byActivity = new Map<string, ActivityLog[]>();
  for (const l of recent) {
    if (l.activityLabel === MOOD_CHECK_LABEL) continue;
    const arr = byActivity.get(l.activityLabel) ?? [];
    arr.push(l);
    byActivity.set(l.activityLabel, arr);
  }

  const stats: ActivityStat[] = [];
  for (const [label, group] of byActivity) {
    const benefit = mean(group.map(rewardOf));
    const rated = group.filter((l) => l.effort !== undefined);
    const avgEffort = rated.length ? mean(rated.map((l) => l.effort!)) : null;
    const worth =
      benefit - (avgEffort === null ? 0 : (avgEffort - 1) * EFFORT_DISCOUNT);
    stats.push({
      label,
      n: group.length,
      benefit: Math.round(benefit),
      moodLift: mean(group.map((l) => l.mood.valence)) - baselineValence,
      avgPleasure: mean(group.map((l) => l.pleasure)),
      avgMastery: mean(group.map((l) => l.mastery)),
      avgEffort,
      worth,
    });
  }
  stats.sort((a, b) => b.worth - a.worth);
  return { baseline, stats };
}

/**
 * The activities worth suggesting: enough logs to mean anything, and a
 * blended return meaningfully above the user's own baseline. Top 3 by worth
 * (return discounted by effort). Always a hypothesis, never a verdict.
 */
export function bestBets(
  logs: ActivityLog[],
  now: number = Date.now(),
  windowDays: number = LEDGER_WINDOW_DAYS,
): ActivityStat[] {
  const { baseline, stats } = activityLedger(logs, now, windowDays);
  return stats
    .filter((s) => s.n >= MIN_ACTIVITY_LOGS && s.benefit >= baseline + BET_MARGIN)
    .slice(0, 3);
}
