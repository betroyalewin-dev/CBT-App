// n-of-1 experiments — "does X actually move my mood?"
//
// Deliberately unlocked only AFTER the user has acclimated to plain logging
// (a couple of days of getting a feel for BA), so the first experience is the
// frictionless core loop, not a study design. Results are framed as a
// *hypothesis*, never a verdict (Design Principle 2): small, confounded samples
// get hedged language, not p-values.

import type { ActivityLog } from "./types";
import { DAY_MS } from "./dashboard";
import { dayIndex } from "./streak";

export type ExperimentMetric = "mood" | "mastery" | "pleasure";

export interface Experiment {
  id: string;
  activityLabel: string; // the "lever" being tested
  metric: ExperimentMetric;
  hypothesis: string;
  startedAt: number;
  days: number; // window length
  claimedAt?: number; // when the XP reward was collected
}

export const ACCLIMATION_DAYS = 2;
export const ACCLIMATION_MIN_LOGS = 4;
export const DEFAULT_EXPERIMENT_DAYS = 14;

const METRIC_LABEL: Record<ExperimentMetric, string> = {
  mood: "mood",
  mastery: "sense of accomplishment",
  pleasure: "enjoyment",
};

export function metricLabel(m: ExperimentMetric): string {
  return METRIC_LABEL[m];
}

/** The raw 0–10-ish value a metric reads from one log (mood = valence). */
export function metricValue(log: ActivityLog, metric: ExperimentMetric): number {
  if (metric === "mastery") return log.mastery;
  if (metric === "pleasure") return log.pleasure;
  return log.mood.valence;
}

export interface Acclimation {
  ready: boolean;
  loggedDays: number;
  daysToGo: number;
  logsToGo: number;
}

/**
 * "Acclimated" = has actually lived with logging across a couple of distinct
 * days, with at least a handful of entries. Distinct days (not wall-clock alone)
 * is what "got a feel for the BA part" really means.
 */
export function acclimation(
  logs: ActivityLog[],
  now: number = Date.now(),
): Acclimation {
  void now;
  const days = new Set(logs.map((l) => dayIndex(l.timestamp))).size;
  const ready = days >= ACCLIMATION_DAYS && logs.length >= ACCLIMATION_MIN_LOGS;
  return {
    ready,
    loggedDays: days,
    daysToGo: Math.max(0, ACCLIMATION_DAYS - days),
    logsToGo: Math.max(0, ACCLIMATION_MIN_LOGS - logs.length),
  };
}

export function isAcclimated(logs: ActivityLog[], now?: number): boolean {
  return acclimation(logs, now).ready;
}

export interface ExperimentResult {
  withMean: number | null;
  withoutMean: number | null;
  withN: number;
  withoutN: number;
  delta: number | null; // with − without, in metric units
  elapsedDays: number;
  totalDays: number;
  done: boolean;
  /** Enough of both groups to even hint at a contrast. */
  hasEnough: boolean;
  metric: ExperimentMetric;
}

function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export function evaluateExperiment(
  exp: Experiment,
  logs: ActivityLog[],
  now: number = Date.now(),
): ExperimentResult {
  const end = exp.startedAt + exp.days * DAY_MS;
  const inWindow = logs.filter(
    (l) => l.timestamp >= exp.startedAt && l.timestamp <= Math.min(now, end),
  );
  const withLogs = inWindow.filter((l) => l.activityLabel === exp.activityLabel);
  const withoutLogs = inWindow.filter(
    (l) => l.activityLabel !== exp.activityLabel,
  );
  const withMean = mean(withLogs.map((l) => metricValue(l, exp.metric)));
  const withoutMean = mean(withoutLogs.map((l) => metricValue(l, exp.metric)));
  const elapsedDays = Math.min(
    exp.days,
    Math.max(0, Math.floor((now - exp.startedAt) / DAY_MS)),
  );
  return {
    withMean,
    withoutMean,
    withN: withLogs.length,
    withoutN: withoutLogs.length,
    delta:
      withMean !== null && withoutMean !== null ? withMean - withoutMean : null,
    elapsedDays,
    totalDays: exp.days,
    done: now >= end,
    hasEnough: withLogs.length >= 2 && withoutLogs.length >= 2,
    metric: exp.metric,
  };
}

/** Honest, hedged read of a result — a hypothesis, never a verdict. */
export function readExperiment(exp: Experiment, r: ExperimentResult): string {
  const what = `"${exp.activityLabel}"`;
  const unit = metricLabel(exp.metric);
  if (!r.hasEnough) {
    return `Not enough yet to compare. Keep logging, we need a few days both with and without ${what} before anything is worth reading.`;
  }
  const d = r.delta ?? 0;
  if (Math.abs(d) < 0.6) {
    return `So far, ${what} hasn't clearly changed your ${unit} either way. A flat result is honest information too.`;
  }
  const dir = d > 0 ? "higher" : "lower";
  return `On the days you logged ${what}, your ${unit} ran about ${Math.abs(
    d,
  ).toFixed(1)} ${dir} than other days. Small, confounded sample, a hunch worth holding, not proof.`;
}
