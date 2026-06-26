import type { ActivityLog } from "./types";
import { DAY_MS } from "./dashboard";

export type InsightKind = "lever" | "mastery-gap" | "prediction-gap";

export interface Insight {
  id: string;
  kind: InsightKind;
  /** Honest, hedged wording — a "pattern worth testing", never a verdict. */
  text: string;
  sampleSize: number;
  /** Seed for the Experiments feature. */
  experimentPrompt: string;
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Surface noisy, confounded patterns honestly. We never say "this works for you";
 * we say "here's a pattern worth testing" and offer to turn it into an experiment.
 */
export function generateInsights(
  logs: ActivityLog[],
  now: number = Date.now(),
): Insight[] {
  const out: Insight[] = [];
  if (logs.length < 3) return out;

  const overallValence = mean(logs.map((l) => l.mood.valence));

  // 1. Candidate "levers": activities whose mood runs meaningfully above baseline.
  const byActivity = new Map<string, ActivityLog[]>();
  for (const l of logs) {
    const arr = byActivity.get(l.activityLabel) ?? [];
    arr.push(l);
    byActivity.set(l.activityLabel, arr);
  }
  for (const [label, group] of byActivity) {
    if (group.length < 2) continue;
    const avg = mean(group.map((l) => l.mood.valence));
    const lift = avg - overallValence;
    if (lift >= 1) {
      out.push({
        id: `lever:${label}`,
        kind: "lever",
        text: `On the ${group.length} times you logged "${label}", your mood averaged ${lift.toFixed(1)} higher than usual. Small sample — worth testing, not proof.`,
        sampleSize: group.length,
        experimentPrompt: `Try "${label}" on purpose this week and predict how it'll feel beforehand.`,
      });
    }
  }

  // 2. Mastery gap: mood okay but accomplishment near-zero — invisible to mood-only apps.
  const weekAgo = now - 7 * DAY_MS;
  const recent = logs.filter((l) => l.timestamp >= weekAgo);
  if (recent.length >= 3) {
    const avgMastery = mean(recent.map((l) => l.mastery));
    const avgValence = mean(recent.map((l) => l.mood.valence));
    if (avgMastery < 3 && avgValence >= 0) {
      out.push({
        id: "mastery-gap",
        kind: "mastery-gap",
        text: `Your mood's been holding okay this week, but your sense of accomplishment has averaged near zero. That gap is worth a look.`,
        sampleSize: recent.length,
        experimentPrompt: `Pick one small task with a clear finish line and notice the mastery rating afterward.`,
      });
    }
  }

  // 3. Prediction gap: depression under-predicts. Show when reality beat the forecast.
  const planned = logs.filter(
    (l) => l.planned && l.anticipated !== undefined,
  );
  const beats = planned.filter(
    (l) => l.pleasure > (l.anticipated!.pleasure ?? 0),
  );
  if (planned.length >= 2 && beats.length / planned.length >= 0.5) {
    out.push({
      id: "prediction-gap",
      kind: "prediction-gap",
      text: `${beats.length} of ${planned.length} planned activities turned out better than you predicted. Your forecasts may be running pessimistic.`,
      sampleSize: planned.length,
      experimentPrompt: `Before your next planned activity, write down your prediction — then compare.`,
    });
  }

  return out;
}
