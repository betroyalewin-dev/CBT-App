// Seeded activity catalog.
//
// Logging dies if it asks a tired user to *type*. So almost any common day
// should have a tappable match here, and the typed case ("+ something else")
// should happen at most once before becoming a chip of its own.
//
// Each activity carries a BA "lean": whether it tends to give Pleasure,
// Mastery, both, or neither. The neutral lean is deliberate — the low-key
// category exists so a flat, withdrawn day is still loggable, and those
// activities should not be scored as if they "landed."

/** Which of BA's two axes an activity tends to feed. */
export type ActivityLean = "pleasure" | "mastery" | "mixed" | "neutral";

export interface SeedActivity {
  label: string;
  lean: ActivityLean;
}

export interface ActivityCategory {
  key: string;
  /** Plain-spoken group title — warm, never clinical. */
  title: string;
  activities: SeedActivity[];
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  {
    key: "movement",
    title: "Movement & body",
    activities: [
      { label: "Went for a walk", lean: "mixed" },
      { label: "Exercised or worked out", lean: "mastery" },
      { label: "Stretched or did yoga", lean: "mixed" },
      { label: "Spent time outside", lean: "pleasure" },
      { label: "Cooked a meal", lean: "mastery" },
      { label: "Showered or self-care", lean: "mastery" },
      { label: "Got decent sleep", lean: "mastery" },
    ],
  },
  {
    key: "connection",
    title: "Connection",
    activities: [
      { label: "Saw a friend in person", lean: "pleasure" },
      { label: "Called or texted someone", lean: "pleasure" },
      { label: "Time with family", lean: "pleasure" },
      { label: "Time with a pet", lean: "pleasure" },
      { label: "Met someone new", lean: "mixed" },
      { label: "Helped someone", lean: "mixed" },
    ],
  },
  {
    key: "responsibilities",
    title: "Getting things done",
    activities: [
      { label: "Worked or studied", lean: "mastery" },
      { label: "Finished something I'd put off", lean: "mastery" },
      { label: "Ran an errand", lean: "mastery" },
      { label: "Cleaned or tidied up", lean: "mastery" },
      { label: "Handled admin or a bill", lean: "mastery" },
    ],
  },
  {
    key: "restoration",
    title: "Rest & pleasure",
    activities: [
      { label: "Watched a show or movie", lean: "pleasure" },
      { label: "Listened to music", lean: "pleasure" },
      { label: "Read", lean: "pleasure" },
      { label: "Played a game", lean: "pleasure" },
      { label: "A hobby or made something", lean: "mixed" },
      { label: "Took a nap", lean: "pleasure" },
      { label: "Ate something I enjoyed", lean: "pleasure" },
    ],
  },
  {
    key: "mind",
    title: "Mind & meaning",
    activities: [
      { label: "Meditated or breathed", lean: "mixed" },
      { label: "Journaled", lean: "mixed" },
      { label: "Did something I value", lean: "mixed" },
      { label: "Spiritual or religious practice", lean: "mixed" },
      { label: "Time in nature", lean: "pleasure" },
    ],
  },
  {
    key: "lowkey",
    // The honest category. Most apps only seed aspirational activities, so a
    // withdrawn day has nothing to tap and goes unlogged — and then the data
    // can't see the baseline that makes every later insight meaningful.
    title: "Low-key or hard days",
    activities: [
      { label: "Scrolled my phone a lot", lean: "neutral" },
      { label: "Stayed in bed", lean: "neutral" },
      { label: "Didn't leave the house", lean: "neutral" },
      { label: "Kept to myself", lean: "neutral" },
      { label: "Hard to remember today", lean: "neutral" },
    ],
  },
];

/** Flat list of every seeded label, in category order. */
export const SEED_ACTIVITY_LABELS: string[] = ACTIVITY_CATEGORIES.flatMap((c) =>
  c.activities.map((a) => a.label),
);

const LEAN_BY_LABEL: Map<string, ActivityLean> = new Map(
  ACTIVITY_CATEGORIES.flatMap((c) =>
    c.activities.map((a) => [a.label, a.lean] as const),
  ),
);

/** Look up an activity's BA lean by label; undefined for user-typed entries. */
export function leanForActivity(label: string): ActivityLean | undefined {
  return LEAN_BY_LABEL.get(label);
}
