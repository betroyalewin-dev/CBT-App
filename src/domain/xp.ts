// Growth / XP — an anhedonia-safe progression layer.
//
// Design constraints (from PRODUCT.md + the onboarding research):
//   • XP only ever goes UP. No loss, no expiry, no reset, no daily target that
//     can curdle into "you failed". (That's the streak failure mode we avoid.)
//   • Every log earns the SAME base, regardless of mood. A bad day you still
//     logged is rewarded for showing up — not for feeling better. This keeps the
//     reward off the symptom and on the behaviour the user controls.
//   • Bonuses reward BA *behaviours* (following through on a plan, finishing an
//     experiment) and one genuine "measured improvement": a PHQ-9 re-check that
//     actually came down. A worse score is never penalised — just no bonus.

import type { PHQ9Result } from "./types";

export const XP = {
  log: 12, // base: showing up at all
  planned: 18, // followed through on a planned activity (BA core)
  experiment: 60, // finished an n-of-1 experiment
  phq9Improved: 40, // a check-in measurably better than the last
} as const;

export interface AwardItem {
  amount: number;
  /** Warm, plain reason shown next to the points. */
  reason: string;
}

export interface XpAward {
  id: string;
  at: number;
  items: AwardItem[];
  total: number;
  /** Set when this award pushed the user into a new level. */
  levelUp?: number;
}

/** Cumulative XP required to *reach* a level. Gentle, gradually widening steps. */
export function levelFloor(level: number): number {
  const l = Math.max(1, level);
  return 30 * (l - 1) * l; // L1:0  L2:60  L3:180  L4:360  L5:600 …
}

/** Soft, growth-themed stage names — never "rank 7 / pro". */
const STAGE_LABELS = [
  "Taking root",
  "Finding rhythm",
  "Steadier ground",
  "Building momentum",
  "Growing roots",
  "Settling in",
  "Quietly thriving",
];

export interface LevelInfo {
  level: number;
  label: string;
  floor: number;
  ceil: number;
  into: number; // xp earned within the current level
  span: number; // xp width of the current level
  toNext: number; // xp remaining to the next level
  progress: number; // 0..1 within the current level
}

export function levelFromXp(xp: number): LevelInfo {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  while (levelFloor(level + 1) <= safe) level += 1;
  const floor = levelFloor(level);
  const ceil = levelFloor(level + 1);
  const span = ceil - floor;
  const into = safe - floor;
  const label = STAGE_LABELS[Math.min(level - 1, STAGE_LABELS.length - 1)];
  return {
    level,
    label,
    floor,
    ceil,
    into,
    span,
    toNext: Math.max(0, ceil - safe),
    progress: span > 0 ? into / span : 0,
  };
}

/** XP earned by saving one activity log. */
export function awardForLog(planned: boolean): AwardItem[] {
  const items: AwardItem[] = [{ amount: XP.log, reason: "for showing up" }];
  if (planned) {
    items.push({ amount: XP.planned, reason: "you stuck with a plan" });
  }
  return items;
}

/** XP for a new PHQ-9 check-in, given the previous one (if any). */
export function awardForPhq9(
  prev: PHQ9Result | undefined,
  next: PHQ9Result,
): AwardItem[] {
  if (prev && next.total < prev.total) {
    return [
      {
        amount: XP.phq9Improved,
        reason: "your check-in came down since last time",
      },
    ];
  }
  return [];
}

export function sumAward(items: AwardItem[]): number {
  return items.reduce((a, b) => a + b.amount, 0);
}
