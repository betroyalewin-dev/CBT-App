import type { MoodPoint, QuadrantKey } from "./types";

export const MOOD_MIN = -5;
export const MOOD_MAX = 5;

/** Map a −5…+5 axis value to 0…100. */
export function toPercent(v: number): number {
  const clamped = Math.max(MOOD_MIN, Math.min(MOOD_MAX, v));
  return ((clamped - MOOD_MIN) / (MOOD_MAX - MOOD_MIN)) * 100;
}

/** Map 0…10 (Pleasure/Mastery) to 0…100. */
export function pmToPercent(v: number): number {
  const clamped = Math.max(0, Math.min(10, v));
  return clamped * 10;
}

export interface EmotionRegion {
  key: string;
  label: string;
  /** Position hint for rendering the region label on the grid. */
  corner: "tl" | "tr" | "bl" | "br";
}

/**
 * Discrete emotion words are *regions* on the circumplex (affect labeling).
 * Returns the region for a mood point. Center is "neutral".
 */
export function emotionRegion(mood: MoodPoint): EmotionRegion {
  const { valence, arousal } = mood;
  if (Math.abs(valence) < 1 && Math.abs(arousal) < 1) {
    return { key: "neutral", label: "neutral", corner: "bl" };
  }
  if (valence < 0 && arousal >= 0)
    return { key: "agitated", label: "anxious / agitated", corner: "tl" };
  if (valence < 0 && arousal < 0)
    return { key: "flat", label: "sad / numb / flat", corner: "bl" };
  if (valence >= 0 && arousal < 0)
    return { key: "calm", label: "calm / content", corner: "br" };
  return { key: "excited", label: "excited / energized", corner: "tr" };
}

/**
 * The dashboard 2×2 quadrant from reward/stress percentages (0–100).
 * Shares its coordinate system with the mood grid: reward≈valence, stress≈arousal.
 */
export function quadrantFromAxis(reward: number, stress: number): QuadrantKey {
  const highReward = reward >= 50;
  const highStress = stress >= 50;
  if (highReward && !highStress) return "thriving";
  if (highReward && highStress) return "stressed";
  if (!highReward && !highStress) return "numb";
  return "flat";
}

export const QUADRANT_META: Record<
  QuadrantKey,
  { title: string; advice: string }
> = {
  thriving: {
    title: "Engaged & calm",
    advice:
      "Protect what's working — keep the activities that land on your calendar.",
  },
  stressed: {
    title: "Busy & rewarding",
    advice:
      "Keep the rewarding parts; shed one source of pressure before it tips over.",
  },
  numb: {
    title: "Calm, but nothing's landing",
    advice:
      "Add one small win or a little novelty aimed at something you value.",
  },
  flat: {
    title: "Drowning & flat",
    advice:
      "Take one thing off your plate, then add one tiny, soothing thing. You're not behind.",
  },
};
