// Activity categories and the recommender that turns "where you are" into a
// concrete next thing to try — framed as an n-of-1 experiment, never an order.
//
// Three categories on a deliberate difficulty ladder (BA + the wider depression
// literature: social contact is the strongest, most durable behavioral
// antidepressant, and sits between effortless pleasure and effortful mastery):
//
//   pleasure   — easiest, hedonic, short-term lift (anti-anhedonia)
//   connection — medium effort, social, durable lift
//   mastery    — hardest, accomplishment, builds self-efficacy
//
// The recommender combines two questions the user named:
//   1. "what will be easier" → the journey's pleasureBias picks a target rung on
//      the ladder (deep dip → pleasure; steadier → mastery)
//   2. "what they're most deficient in" → recent logs show which category is
//      starved (low pleasure/mastery ratings; little social contact)
// so we nudge the easiest *useful* thing, not just the easiest or the most-missing.

import type { ActivityLog } from "./types";
import type { JourneySignal } from "./journey";
import type { ExperimentMetric } from "./experiments";
import { DAY_MS } from "./dashboard";

export type ActivityCategory = "pleasure" | "connection" | "mastery";

/** Position on the easy→hard ladder. Drives the journey-bias match. */
export const CATEGORY_DIFFICULTY: Record<ActivityCategory, number> = {
  pleasure: 1,
  connection: 2,
  mastery: 3,
};

export const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; blurb: string; metric: ExperimentMetric }
> = {
  pleasure: {
    label: "Pleasure",
    blurb: "something for pure enjoyment — low effort, quick lift",
    metric: "pleasure",
  },
  connection: {
    label: "Connection",
    blurb: "a bit of contact with another person — the most durable lift there is",
    metric: "mood",
  },
  mastery: {
    label: "Mastery",
    blurb: "a small thing with a finish line — a real sense of accomplishment",
    metric: "mastery",
  },
};

/** Seed activities (from onboarding values) → category. Lower-cased keys. */
const CATALOG: Record<string, ActivityCategory> = {
  "message a friend": "connection",
  "time with family": "connection",
  "a short walk": "pleasure",
  "cook something": "mastery",
  "make something": "mastery",
  "play music": "pleasure",
  "one focused task": "mastery",
  "tidy a space": "mastery",
  "read a few pages": "pleasure",
  "learn something small": "mastery",
  "step outside": "pleasure",
  "sit in daylight": "pleasure",
  "breathe / stretch": "pleasure",
  "warm shower": "pleasure",
  "something fun": "pleasure",
  "a favorite show": "pleasure",
};

/** Plain "I just opened the app" labels that aren't really activities. */
const NON_ACTIVITY = new Set([
  "mood check",
  "first check-in",
  "check-in",
]);

const CONNECTION_WORDS = [
  "friend", "family", "call", "text", "message", "people", "meet",
  "coffee", "visit", "talk", "mom", "dad", "partner", "social", "dinner with",
];
const MASTERY_WORDS = [
  "clean", "tidy", "work", "task", "finish", "fix", "study", "learn",
  "cook", "build", "make", "organize", "organise", "chore", "errand",
  "exercise", "workout", "run", "gym", "write", "project", "email", "pay",
];

export function isTrackableActivity(label: string): boolean {
  return !NON_ACTIVITY.has(label.trim().toLowerCase());
}

/**
 * Best-guess category for any label. Known seeds map exactly; custom labels fall
 * back to keyword cues, then default to "pleasure" (the lowest-pressure rung).
 */
export function categorize(label: string): ActivityCategory {
  const key = label.trim().toLowerCase();
  if (CATALOG[key]) return CATALOG[key];
  if (CONNECTION_WORDS.some((w) => key.includes(w))) return "connection";
  if (MASTERY_WORDS.some((w) => key.includes(w))) return "mastery";
  return "pleasure";
}

/** A sensible default activity per category when the user tracks none. */
export const DEFAULT_BY_CATEGORY: Record<ActivityCategory, string> = {
  pleasure: "Something you enjoy",
  connection: "Message a friend",
  mastery: "One small task",
};

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** Share of recent logs we'd want to be social, for the connection-deficiency read. */
export const TARGET_CONNECTION_SHARE = 0.3;

export interface Deficiency {
  /** Per-category 0…1, higher = more starved. */
  pleasure: number;
  connection: number;
  mastery: number;
  sampleSize: number;
}

function recentActivityLogs(logs: ActivityLog[], now: number): ActivityLog[] {
  const cutoff = now - 7 * DAY_MS;
  const within = logs.filter(
    (l) => l.timestamp >= cutoff && l.timestamp <= now && isTrackableActivity(l.activityLabel),
  );
  if (within.length) return within;
  return [...logs]
    .filter((l) => l.timestamp <= now && isTrackableActivity(l.activityLabel))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
}

/**
 * What the recent log stream is starved of. Pleasure/mastery come straight off
 * the sliders; connection is inferred from how rarely social activities show up.
 */
export function analyzeDeficiency(
  logs: ActivityLog[],
  now: number = Date.now(),
): Deficiency {
  const recent = recentActivityLogs(logs, now);
  if (!recent.length) {
    return { pleasure: 0.5, connection: 0.5, mastery: 0.5, sampleSize: 0 };
  }
  const pleasure = 1 - mean(recent.map((l) => l.pleasure)) / 10;
  const mastery = 1 - mean(recent.map((l) => l.mastery)) / 10;
  const connShare =
    recent.filter((l) => categorize(l.activityLabel) === "connection").length /
    recent.length;
  const connection = Math.max(
    0,
    Math.min(1, 1 - connShare / TARGET_CONNECTION_SHARE),
  );
  return {
    pleasure: Math.max(0, Math.min(1, pleasure)),
    connection,
    mastery: Math.max(0, Math.min(1, mastery)),
    sampleSize: recent.length,
  };
}

export interface Recommendation {
  category: ActivityCategory;
  activityLabel: string;
  metric: ExperimentMetric;
  hypothesis: string;
  /** Honest "why this, why now" tying journey + deficiency together. */
  rationale: string;
  /** Per-category scores, exposed for transparency/debugging. */
  scores: Record<ActivityCategory, number>;
}

const CATEGORIES: ActivityCategory[] = ["pleasure", "connection", "mastery"];

/** Journey bias → target rung on the difficulty ladder (1 pleasure … 3 mastery). */
function targetDifficulty(pleasureBias: number): number {
  return 1 + (1 - pleasureBias) * 2;
}

/** Spread of the match curve; tighter = harder gating of off-target rungs. */
const MATCH_SIGMA = 0.55;

/**
 * How well a category matches the target rung, 0…1. A Gaussian (not linear) so an
 * off-target rung falls away fast — e.g. when stabilizing, mastery is effectively
 * off the table, and connection (socially effortful) is well below pleasure.
 */
function easeWeight(cat: ActivityCategory, pleasureBias: number): number {
  const dist = CATEGORY_DIFFICULTY[cat] - targetDifficulty(pleasureBias);
  return Math.exp(-(dist * dist) / (2 * MATCH_SIGMA * MATCH_SIGMA));
}

/** Pick the tracked activity in a category logged least recently (nudge variety). */
function pickActivity(
  category: ActivityCategory,
  activities: string[],
  logs: ActivityLog[],
  now: number,
): string {
  const inCat = activities.filter(
    (a) => isTrackableActivity(a) && categorize(a) === category,
  );
  if (!inCat.length) return DEFAULT_BY_CATEGORY[category];
  const lastSeen = new Map<string, number>();
  for (const l of logs) {
    if (l.timestamp > now) continue;
    const prev = lastSeen.get(l.activityLabel) ?? -Infinity;
    if (l.timestamp > prev) lastSeen.set(l.activityLabel, l.timestamp);
  }
  return [...inCat].sort(
    (a, b) => (lastSeen.get(a) ?? -Infinity) - (lastSeen.get(b) ?? -Infinity),
  )[0];
}

export interface RecommendInput {
  journey: JourneySignal;
  logs: ActivityLog[];
  activities: string[];
  now?: number;
}

/**
 * The next experiment worth running: the easiest *useful* category given where
 * the person is (journey bias) and what their data is starved of (deficiency).
 */
export function recommendActivity(input: RecommendInput): Recommendation {
  const { journey, logs, activities } = input;
  const now = input.now ?? Date.now();
  const def = analyzeDeficiency(logs, now);

  const scores = {} as Record<ActivityCategory, number>;
  for (const cat of CATEGORIES) {
    // ease (what's appropriate now) × need (0.5 baseline + how starved we are)
    scores[cat] = easeWeight(cat, journey.pleasureBias) * (0.5 + def[cat]);
  }
  const category = CATEGORIES.reduce((best, cat) =>
    scores[cat] > scores[best] ? cat : best,
  );

  const activityLabel = pickActivity(category, activities, logs, now);
  const meta = CATEGORY_META[category];

  return {
    category,
    activityLabel,
    metric: meta.metric,
    hypothesis: `Does "${activityLabel}" move my ${
      meta.metric === "mood" ? "mood" : meta.label.toLowerCase()
    }?`,
    rationale: rationaleFor(category, journey, def),
    scores,
  };
}

function rationaleFor(
  category: ActivityCategory,
  journey: JourneySignal,
  def: Deficiency,
): string {
  const meta = CATEGORY_META[category];
  const lead =
    journey.stage === "stabilizing" || journey.stage === "activating"
      ? "You're early in rebuilding momentum, so we're keeping it gentle"
      : journey.stage === "building"
        ? "You've got some momentum, so this is a good next step"
        : "You're in a steadier place, so this is worth a push";
  const starved =
    def.sampleSize === 0
      ? ""
      : category === "connection"
        ? " — and social contact has been thin lately."
        : ` — and your ${meta.label.toLowerCase()} ratings have been on the low side lately.`;
  return `${lead}: ${meta.blurb}${starved || "."}`;
}
