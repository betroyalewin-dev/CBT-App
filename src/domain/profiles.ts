import type { AxisScores, Profile, ProfileKey } from "./types";

/** Midpoint of each 0–100 axis; at/above is "high". */
export const AXIS_MIDPOINT = 50;

export const PROFILES: Record<ProfileKey, Profile> = {
  drowning: {
    key: "drowning",
    title: "Carrying a lot right now",
    blurb:
      "Your load feels high — everything's a bit too much. The lever that tends to help here is taking weight off, not adding more.",
    recommendations: [
      "Start by reducing load: pick one thing to drop or postpone today.",
      "Soothing, low-effort activities count — rest is doing something.",
      "Reach for support: a short message to one person can lighten things.",
    ],
  },
  numb: {
    key: "numb",
    title: "Things aren't landing",
    blurb:
      "You're not overwhelmed so much as flat — good things don't register. The lever here is gentle novelty and small wins, not more rest.",
    recommendations: [
      "Try one small thing with a sense of accomplishment (mastery).",
      "Add a little novelty or challenge — boredom feeds the flatness.",
      "Point activities at something you value, even slightly.",
    ],
  },
  both: {
    key: "both",
    title: "Overwhelmed and running on empty",
    blurb:
      "Both at once: too much load and too little reward. We'll go slow — first take a little weight off, then rebuild small wins.",
    recommendations: [
      "Take one thing off your plate before adding anything.",
      "Then add a single tiny, rewarding activity — start absurdly small.",
      "Be patient with yourself; small and steady beats big and brittle.",
    ],
  },
  mild: {
    key: "mild",
    title: "Holding steady",
    blurb:
      "You're in a relatively okay place. Tracking now builds a baseline so you can see what helps before things dip.",
    recommendations: [
      "Keep logging — a baseline is what makes later insights useful.",
      "Schedule activities that reliably feel good or accomplished.",
      "Notice early what drains you, so you can adjust sooner.",
    ],
  },
};

/** Assign one of the four 2×2 profiles from axis scores. */
export function assignProfile(axis: AxisScores): ProfileKey {
  const lowReward = axis.reward < AXIS_MIDPOINT;
  const highStress = axis.stress >= AXIS_MIDPOINT;
  if (lowReward && highStress) return "both";
  if (lowReward) return "numb";
  if (highStress) return "drowning";
  return "mild";
}
