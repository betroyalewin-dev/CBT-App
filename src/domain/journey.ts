// Recovery "journey" — where the person is along the climb out, and which lever
// (pleasure vs. mastery) to lean on *right now*.
//
// Clinical basis (Behavioral Activation): early in depression, activation energy
// is scarce and harder "mastery" tasks fail. Easy, pleasant, short-term-rewarding
// activities rebuild behavioral momentum first; only once reward is flowing again
// do graded mastery tasks tend to stick. So the deeper the dip, the more we tilt
// recommendations toward pleasure — then shift toward mastery as the person climbs.
//
// The read blends two sources, honestly weighted by how much data we have:
//   • onboarding (PHQ-9 severity + reward/stress axis) — all we have on day one
//   • recent logging (smoothed reward/stress) — trusted more as entries accumulate
// so the picture is a *living* one, not frozen at the intake snapshot.

import type { ActivityLog, AxisScores, PHQ9Result } from "./types";
import { rewardOf, stressOf, DAY_MS } from "./dashboard";

export type JourneyStage =
  | "stabilizing"
  | "activating"
  | "building"
  | "steady";

export interface JourneySignal {
  /** 0 (deep in it) … 100 (climbed out / holding steady). */
  recovery: number;
  stage: JourneyStage;
  /**
   * How far to tilt recommendations toward *pleasure* over *mastery*, 0…1.
   * High when recovery is low (build momentum with easy wins); low when steady
   * (lean into accomplishment). Clamped to a sane band so neither is ever ignored.
   */
  pleasureBias: number;
  /** How much recent logs (vs. the onboarding snapshot) drove this read, 0…1. */
  logWeight: number;
  /** Warm, non-clinical heading. */
  title: string;
  /** One line: what to lean into now. */
  focus: string;
  /** Honest "why we're nudging this way." */
  rationale: string;
}

/** Logs are trusted to fully drive the read at ~this many recent entries. */
export const JOURNEY_FULL_TRUST_LOGS = 14;
/** Even with lots of data, keep a little anchor to the intake snapshot. */
export const MAX_LOG_WEIGHT = 0.85;
/** Recency window for the "recent logging" read. */
export const RECENT_WINDOW_DAYS = 7;

const PLEASURE_BIAS_FLOOR = 0.25;
const PLEASURE_BIAS_CEIL = 0.85;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function weightedMean(parts: { v: number; w: number }[]): number {
  const wSum = parts.reduce((a, p) => a + p.w, 0);
  if (wSum === 0) return 0;
  return parts.reduce((a, p) => a + p.v * p.w, 0) / wSum;
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** Recovery implied by the intake snapshot (0…100). Reward dominates (anhedonia). */
export function onboardingRecovery(
  axis: AxisScores,
  phq9?: PHQ9Result,
): number {
  const parts: { v: number; w: number }[] = [
    { v: clamp(axis.reward, 0, 100), w: 0.5 },
    { v: 100 - clamp(axis.stress, 0, 100), w: 0.2 },
  ];
  if (phq9) {
    parts.push({ v: (1 - clamp(phq9.total, 0, 27) / 27) * 100, w: 0.3 });
  }
  return weightedMean(parts);
}

/** Recently logged entries, newest within the window (fallback: last 10 logs). */
function recentLogs(logs: ActivityLog[], now: number): ActivityLog[] {
  const cutoff = now - RECENT_WINDOW_DAYS * DAY_MS;
  const within = logs.filter((l) => l.timestamp >= cutoff && l.timestamp <= now);
  if (within.length) return within;
  return [...logs]
    .filter((l) => l.timestamp <= now)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
}

/** Recovery implied by recent logs (0…100). Reward-weighted, stress drags it. */
export function loggedRecovery(logs: ActivityLog[]): number | null {
  if (!logs.length) return null;
  const reward = mean(logs.map(rewardOf));
  const stress = mean(logs.map(stressOf));
  return clamp(0.7 * reward + 0.3 * (100 - stress), 0, 100);
}

function stageOf(recovery: number): JourneyStage {
  if (recovery < 30) return "stabilizing";
  if (recovery < 55) return "activating";
  if (recovery < 75) return "building";
  return "steady";
}

const STAGE_COPY: Record<JourneyStage, Pick<JourneySignal, "title" | "focus">> = {
  stabilizing: {
    title: "Finding your footing",
    focus: "Lean into easy, soothing, enjoyable things. Rest counts.",
  },
  activating: {
    title: "Building momentum",
    focus: "Small pleasant things, and maybe one bit of gentle connection.",
  },
  building: {
    title: "Gaining ground",
    focus: "Keep the enjoyable stuff, and start mixing in small wins.",
  },
  steady: {
    title: "Holding steady",
    focus: "You can reach for accomplishment and things that matter to you.",
  },
};

function rationaleFor(stage: JourneyStage): string {
  switch (stage) {
    case "stabilizing":
      return "When things are heavy, easy wins rebuild momentum better than hard tasks. We'll start gentle and let accomplishment come later.";
    case "activating":
      return "You're starting to move. Pleasant, low-effort activities keep the momentum going before we add harder, goal-shaped ones.";
    case "building":
      return "Reward is flowing again, so this is a good moment to fold in small tasks that give a sense of accomplishment.";
    case "steady":
      return "You're in a steadier place — mastery and values-driven goals tend to pay off and protect against the next dip.";
  }
}

export interface JourneyInput {
  axis: AxisScores;
  phq9?: PHQ9Result;
  logs: ActivityLog[];
  now?: number;
}

/**
 * Assess where the person is in their recovery, blending the intake snapshot with
 * recent logging (trusting logs more as they pile up), and derive how far to tilt
 * recommendations toward pleasure (low recovery) vs. mastery (high recovery).
 */
export function assessJourney(input: JourneyInput): JourneySignal {
  const { axis, phq9, logs } = input;
  const now = input.now ?? Date.now();

  const onboarding = onboardingRecovery(axis, phq9);
  const recent = recentLogs(logs, now);
  const logged = loggedRecovery(recent);

  const logWeight =
    logged === null
      ? 0
      : clamp(recent.length / JOURNEY_FULL_TRUST_LOGS, 0, 1) * MAX_LOG_WEIGHT;

  const recovery = Math.round(
    onboarding * (1 - logWeight) + (logged ?? 0) * logWeight,
  );

  // Smoothly tilt toward pleasure as recovery falls, within a sane band.
  const pleasureBias =
    Math.round(
      clamp(0.85 - (recovery / 100) * 0.6, PLEASURE_BIAS_FLOOR, PLEASURE_BIAS_CEIL) *
        100,
    ) / 100;

  const stage = stageOf(recovery);
  return {
    recovery,
    stage,
    pleasureBias,
    logWeight: Math.round(logWeight * 100) / 100,
    title: STAGE_COPY[stage].title,
    focus: STAGE_COPY[stage].focus,
    rationale: rationaleFor(stage),
  };
}
