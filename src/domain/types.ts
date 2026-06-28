// Core domain types for the BA (Behavioral Activation) model.
// Mood is a circumplex point: valence (pleasant↔unpleasant) × arousal (calm↔activated).

import type { Experiment } from "./experiments";
import type { XpAward } from "./xp";

/** A point on the valence×arousal circumplex. Both axes are −5…+5. */
export interface MoodPoint {
  valence: number; // −5 (unpleasant) … +5 (pleasant)
  arousal: number; // −5 (calm/low energy) … +5 (activated/high energy)
}

/** Pleasure & Mastery, the two BA ratings, each 0–10. */
export interface PMRating {
  pleasure: number; // 0–10
  mastery: number; // 0–10
}

export interface ActivityLog {
  id: string;
  timestamp: number; // epoch ms
  activityLabel: string;
  mood: MoodPoint;
  pleasure: number; // 0–10
  mastery: number; // 0–10
  emotionTag?: string;
  planned: boolean;
  anticipated?: { mood: MoodPoint; pleasure: number; mastery: number };
  context?: { who?: string; where?: string; energy?: number; sleep?: number };
  note?: string;
}

export interface PHQ9Result {
  /** Per-item scores, 9 items, each 0–3. */
  items: number[];
  total: number; // 0–27
  severity: PHQ9Severity;
  /** Item 9 (self-harm) score, surfaced for safety routing. */
  item9: number;
  /** True when item 9 > 0 — triggers the safety flow. */
  safetyFlag: boolean;
}

export type PHQ9Severity =
  | "minimal"
  | "mild"
  | "moderate"
  | "moderately severe"
  | "severe";

/** The two dashboard axes, derived from logs and onboarding. */
export interface AxisScores {
  /** Reward axis: 0 (anhedonia, nothing lands) … 100 (engaged, things land). */
  reward: number;
  /** Stress axis: 0 (calm) … 100 (overloaded). */
  stress: number;
}

export type ProfileKey = "drowning" | "numb" | "both" | "mild";

export interface Profile {
  key: ProfileKey;
  title: string;
  blurb: string;
  /** Warm, non-clinical lead recommendations for this profile. */
  recommendations: string[];
}

export type QuadrantKey = "thriving" | "stressed" | "numb" | "flat";

export interface SafetyPlan {
  warningSigns: string[];
  copingSteps: string[];
  contacts: string[];
  reasonsForLiving: string[];
  updatedAt?: number;
}

export interface AppState {
  onboarded: boolean;
  phq9History: PHQ9Result[];
  axis: AxisScores;
  profile?: ProfileKey;
  values: string[];
  activities: string[]; // tracked activity labels
  logs: ActivityLog[];
  safetyPlan: SafetyPlan;
  anxiousFlag: boolean;
  /** Growth points — monotonic, never lost (see domain/xp.ts). */
  xp: number;
  /** Active and completed n-of-1 experiments (see domain/experiments.ts). */
  experiments: Experiment[];
  /** Transient: the most recent XP award, for the reward animation. Not persisted. */
  lastAward?: XpAward | null;
}
