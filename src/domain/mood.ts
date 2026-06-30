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

/** Neutral band half-width on each −5…+5 axis (matches emotionRegion). */
const NEUTRAL_BAND = 1;

type Band = "lo" | "mid" | "hi";

function band(v: number): Band {
  if (v <= -NEUTRAL_BAND) return "lo";
  if (v >= NEUTRAL_BAND) return "hi";
  return "mid";
}

/**
 * A plain-language read of a mood point — the live readout under the grid.
 * Narrates the *continuous* space as one short, honest phrase (valence × arousal),
 * so a tired user just moves the dot until the words fit, instead of decoding two
 * axes. Rows = valence (unpleasant→pleasant), columns = arousal (calm→activated).
 */
export function moodPhrase(mood: MoodPoint): string {
  const v = band(mood.valence); // lo = unpleasant, hi = pleasant
  const a = band(mood.arousal); // lo = calm/low energy, hi = activated
  const TABLE: Record<Band, Record<Band, string>> = {
    lo: { lo: "Low and heavy", mid: "Low and weary", hi: "Tense and on edge" },
    mid: { lo: "Quiet, neutral", mid: "Right in the middle", hi: "Restless" },
    hi: { lo: "Calm and content", mid: "Good, steady", hi: "Bright and lively" },
  };
  return TABLE[v][a];
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
      "You've had reward without overload lately. Protect what's working — keep the activities that land on your calendar.",
  },
  stressed: {
    title: "Busy & rewarding — watch the load",
    advice:
      "Good things are happening, but the load is high. Keep the rewarding parts; shed one source of pressure before it tips over.",
  },
  numb: {
    title: "Calm, but nothing's landing",
    advice:
      "You're not overwhelmed — things just aren't registering. Add one small win or a little novelty aimed at something you value.",
  },
  flat: {
    title: "Drowning & flat",
    advice:
      "Heavy and unrewarding at once. Take one thing off your plate first, then add one tiny, soothing thing. Go slow — you're not behind.",
  },
};
