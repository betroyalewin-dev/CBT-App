import type { AxisScores } from "./types";

// Onboarding axis-placement items (~6). Each is a 0–3 Likert.
// `axis: "reward"` items measure anhedonia (reverse: more anhedonia → LESS reward).
// `axis: "stress"` items measure negative affect / load (more → MORE stress).
export interface AxisItem {
  prompt: string;
  axis: "reward" | "stress";
}

export const AXIS_ITEMS: AxisItem[] = [
  { prompt: "Things I used to enjoy don't really land anymore.", axis: "reward" },
  { prompt: "Even when something good happens, I don't feel much.", axis: "reward" },
  { prompt: "I struggle to feel a sense of accomplishment.", axis: "reward" },
  { prompt: "Everything feels like too much right now.", axis: "stress" },
  { prompt: "My mind feels on edge, tense, or wound up.", axis: "stress" },
  { prompt: "Small demands pile up and overwhelm me.", axis: "stress" },
];

export const AXIS_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Sometimes" },
  { value: 2, label: "Often" },
  { value: 3, label: "Nearly always" },
];

/**
 * Score axis placement from answers aligned 1:1 with AXIS_ITEMS.
 * Reward = 100 − (anhedonia load): high anhedonia answers pull reward DOWN.
 * Stress = negative-affect load, scaled to 0–100.
 */
export function scoreAxisPlacement(answers: number[]): AxisScores {
  if (answers.length !== AXIS_ITEMS.length) {
    throw new Error(
      `axis placement needs ${AXIS_ITEMS.length} answers, got ${answers.length}`,
    );
  }
  let rewardSum = 0;
  let rewardMax = 0;
  let stressSum = 0;
  let stressMax = 0;
  AXIS_ITEMS.forEach((item, i) => {
    const v = answers[i];
    if (!Number.isInteger(v) || v < 0 || v > 3) {
      throw new Error(`axis answer out of range: ${v}`);
    }
    if (item.axis === "reward") {
      rewardSum += v;
      rewardMax += 3;
    } else {
      stressSum += v;
      stressMax += 3;
    }
  });
  const anhedonia = rewardMax === 0 ? 0 : (rewardSum / rewardMax) * 100;
  const stress = stressMax === 0 ? 0 : (stressSum / stressMax) * 100;
  return {
    reward: Math.round(100 - anhedonia),
    stress: Math.round(stress),
  };
}
