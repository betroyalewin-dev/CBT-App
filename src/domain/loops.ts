// Loop assessment — the tree/loop model from PLANNING.md §2.
//
// The user's own logs already carry most of the signal for "which depression
// maintenance loop is most active right now." This is the interpreting layer
// over that passive data (plus, for now, a couple of proxy signals — see the
// caveats on avoidance/rumination below). It infers a hypothesis; it never
// asks the user to self-classify.
//
// Loops co-occur (someone overwhelmed is often also withdrawing), so scores
// are independent 0-100 severities, not a single forced label.

import type { ActivityLog } from "./types";
import { rewardOf, stressOf, DAY_MS } from "./dashboard";
import { emotionRegion } from "./mood";

export type LoopKey = "withdrawal" | "overwhelm" | "avoidance" | "rumination";

export interface LoopMeta {
  key: LoopKey;
  title: string;
  /** Framed as a hypothesis to confirm, not a diagnosis (Design Principle 2). */
  question: string;
  blurb: string;
}

export const LOOP_META: Record<LoopKey, LoopMeta> = {
  withdrawal: {
    key: "withdrawal",
    title: "the shut-down pattern",
    question:
      "Lately, does it feel like you've pulled back from things, and even the good stuff isn't landing?",
    blurb:
      "Low mood shrinks activity, which shrinks reward and mastery, which lowers mood further.",
  },
  overwhelm: {
    key: "overwhelm",
    title: "the overload pattern",
    question:
      "Does it feel like there's just too much coming at you right now — hard to know where to start?",
    blurb:
      "Demands pile up, it feels unmanageable, and that feeling becomes evidence that it is.",
  },
  avoidance: {
    key: "avoidance",
    title: "the escape pattern",
    question:
      "Have you noticed yourself avoiding or putting things off, getting short-term relief that leaves the problem for later?",
    blurb:
      "Escaping discomfort works immediately and grows the underlying problem quietly.",
  },
  rumination: {
    key: "rumination",
    title: "the stuck-in-your-head pattern",
    question:
      "Do you find yourself replaying things or being hard on yourself in quiet moments, more than actually doing anything?",
    blurb:
      "Free time turns into replaying and self-criticism, which drags mood down and makes starting anything harder.",
  },
};

const WINDOW_DAYS = 7;
const PRIOR_WINDOW_DAYS = 7;
/** If the runner-up is within this many points of the leader, surface both. */
const CO_PRIMARY_MARGIN = 15;

export interface LoopScore {
  key: LoopKey;
  score: number; // 0-100, independent per loop
}

export interface LoopAssessment {
  hasData: boolean;
  /** Sorted descending by score. */
  scores: LoopScore[];
  primary?: LoopKey;
  secondary?: LoopKey;
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Longest gap (in days) between a negative-valence log and the next log after it. */
function longestGapAfterNegativeLog(logs: ActivityLog[], now: number): number {
  const sorted = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  let longest = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].mood.valence >= 0) continue;
    const next = sorted[i + 1]?.timestamp ?? now;
    const gapDays = (next - sorted[i].timestamp) / DAY_MS;
    if (gapDays > longest) longest = gapDays;
  }
  return longest;
}

/**
 * Weighted hypothesis about which maintenance loop(s) are most active,
 * inferred from recent logs (last 7 days) vs. the 7 days before that.
 *
 * Withdrawal and overwhelm read directly off reward/stress and mood-region
 * signals we already have. Avoidance and rumination are coarser proxies today
 * (a logging drop-off after distress; flat-mood notes) — they'll sharpen once
 * TRAP/TRAC capture and note content are available (see PLANNING.md roadmap).
 */
export function assessLoops(
  logs: ActivityLog[],
  now: number = Date.now(),
): LoopAssessment {
  if (logs.length < 3) return { hasData: false, scores: [] };

  const windowMs = WINDOW_DAYS * DAY_MS;
  const priorMs = PRIOR_WINDOW_DAYS * DAY_MS;
  const recent = logs.filter(
    (l) => l.timestamp <= now && now - l.timestamp <= windowMs,
  );
  const prior = logs.filter(
    (l) => now - l.timestamp > windowMs && now - l.timestamp <= windowMs + priorMs,
  );

  if (recent.length === 0) return { hasData: false, scores: [] };

  const rewardMean = mean(recent.map(rewardOf));
  const stressMean = mean(recent.map(stressOf));

  const regions = recent.map((l) => emotionRegion(l.mood));
  const flatFrac = regions.filter((r) => r.key === "flat").length / regions.length;
  const agitatedFrac =
    regions.filter((r) => r.key === "agitated").length / regions.length;

  const recentRate = recent.length / WINDOW_DAYS;
  const priorRate = prior.length / PRIOR_WINDOW_DAYS;
  const rateDrop = priorRate > 0 ? clamp01((priorRate - recentRate) / priorRate) : 0;

  const gapAfterNegative = longestGapAfterNegativeLog([...prior, ...recent], now);

  const flatCount = regions.filter((r) => r.key === "flat").length;
  const flatWithNoteCount = recent.filter(
    (l, i) => regions[i].key === "flat" && !!l.note,
  ).length;
  const noteFrac = flatCount === 0 ? 0 : flatWithNoteCount / flatCount;

  const withdrawal =
    clamp01(0.5 * (1 - rewardMean / 100) + 0.3 * flatFrac + 0.2 * rateDrop) * 100;
  const overwhelm = clamp01(0.6 * (stressMean / 100) + 0.4 * agitatedFrac) * 100;
  const avoidance =
    clamp01(0.5 * rateDrop + 0.5 * clamp01(gapAfterNegative / 3)) * 100;
  const rumination = clamp01(0.5 * flatFrac + 0.5 * noteFrac) * 100;

  const scores: LoopScore[] = (
    [
      { key: "withdrawal", score: Math.round(withdrawal) },
      { key: "overwhelm", score: Math.round(overwhelm) },
      { key: "avoidance", score: Math.round(avoidance) },
      { key: "rumination", score: Math.round(rumination) },
    ] satisfies LoopScore[]
  ).sort((a, b) => b.score - a.score);

  const primary = scores[0].score > 0 ? scores[0].key : undefined;
  const secondary =
    primary && scores[1].score > 0 && scores[0].score - scores[1].score <= CO_PRIMARY_MARGIN
      ? scores[1].key
      : undefined;

  return { hasData: true, scores, primary, secondary };
}
