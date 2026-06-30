import { describe, it, expect } from "vitest";
import {
  categorize,
  isTrackableActivity,
  analyzeDeficiency,
  recommendActivity,
  CATEGORY_META,
} from "./activities";
import { assessJourney, type JourneySignal } from "./journey";
import { DAY_MS } from "./dashboard";
import type { ActivityLog } from "./types";

const NOW = Date.now();

function mk(over: Partial<ActivityLog>): ActivityLog {
  return {
    id: Math.random().toString(36).slice(2),
    timestamp: NOW,
    activityLabel: "Something fun",
    mood: { valence: 0, arousal: 0 },
    pleasure: 5,
    mastery: 5,
    planned: false,
    ...over,
  };
}

// Hand-built journey signals so recommender tests don't depend on journey internals.
const deepDip: JourneySignal = {
  recovery: 12,
  stage: "stabilizing",
  pleasureBias: 0.85,
  logWeight: 0,
  title: "",
  focus: "",
  rationale: "",
};
const recovered: JourneySignal = {
  recovery: 88,
  stage: "steady",
  pleasureBias: 0.25,
  logWeight: 0,
  title: "",
  focus: "",
  rationale: "",
};

describe("categorize", () => {
  it("maps known seed activities", () => {
    expect(categorize("Message a friend")).toBe("connection");
    expect(categorize("Tidy a space")).toBe("mastery");
    expect(categorize("A favorite show")).toBe("pleasure");
  });
  it("uses keyword cues for custom labels", () => {
    expect(categorize("call mom")).toBe("connection");
    expect(categorize("clean the kitchen")).toBe("mastery");
    expect(categorize("watch a movie")).toBe("pleasure");
  });
  it("defaults unknown labels to the lowest-pressure rung", () => {
    expect(categorize("xyzzy")).toBe("pleasure");
  });
  it("recognises non-activities", () => {
    expect(isTrackableActivity("Mood check")).toBe(false);
    expect(isTrackableActivity("A short walk")).toBe(true);
  });
});

describe("analyzeDeficiency", () => {
  it("low mastery ratings → high mastery deficiency", () => {
    const logs = [
      mk({ activityLabel: "Read a few pages", mastery: 1, pleasure: 7 }),
      mk({ activityLabel: "A favorite show", mastery: 0, pleasure: 8 }),
    ];
    const d = analyzeDeficiency(logs, NOW);
    expect(d.mastery).toBeGreaterThan(0.7);
    expect(d.pleasure).toBeLessThan(d.mastery);
  });
  it("no social activity → high connection deficiency", () => {
    const logs = [
      mk({ activityLabel: "A favorite show" }),
      mk({ activityLabel: "Read a few pages" }),
    ];
    expect(analyzeDeficiency(logs, NOW).connection).toBeGreaterThan(0.9);
  });
  it("plenty of social contact → low connection deficiency", () => {
    const logs = [
      mk({ activityLabel: "Message a friend" }),
      mk({ activityLabel: "Time with family" }),
      mk({ activityLabel: "A favorite show" }),
    ];
    expect(analyzeDeficiency(logs, NOW).connection).toBeLessThan(0.3);
  });
});

describe("recommendActivity", () => {
  it("deep dip recommends pleasure even when mastery is the bigger gap (momentum gating)", () => {
    const logs = [
      mk({ activityLabel: "A favorite show", pleasure: 7, mastery: 1 }),
      mk({ activityLabel: "Read a few pages", pleasure: 6, mastery: 0 }),
    ];
    const rec = recommendActivity({ journey: deepDip, logs, activities: [], now: NOW });
    expect(rec.category).toBe("pleasure");
  });

  it("recovered + low mastery (social contact present) recommends mastery", () => {
    // social log keeps connection from being the gap, isolating the mastery axis
    const logs = [
      mk({ activityLabel: "Message a friend", pleasure: 6, mastery: 4 }),
      mk({ activityLabel: "A favorite show", pleasure: 7, mastery: 1 }),
      mk({ activityLabel: "Read a few pages", pleasure: 6, mastery: 0 }),
    ];
    const rec = recommendActivity({ journey: recovered, logs, activities: [], now: NOW });
    expect(rec.category).toBe("mastery");
  });

  it("metric follows the chosen category", () => {
    const rec = recommendActivity({ journey: deepDip, logs: [], activities: [], now: NOW });
    expect(rec.metric).toBe(CATEGORY_META[rec.category].metric);
  });

  it("prefers a tracked activity in the chosen category over a default", () => {
    const rec = recommendActivity({
      journey: recovered,
      logs: [
        mk({ activityLabel: "Message a friend", mastery: 5 }),
        mk({ activityLabel: "A favorite show", mastery: 1 }),
      ],
      activities: ["Cook something", "A favorite show"],
      now: NOW,
    });
    expect(rec.category).toBe("mastery");
    expect(rec.activityLabel).toBe("Cook something");
  });

  it("falls back to a sensible default when no activity is tracked in-category", () => {
    const rec = recommendActivity({ journey: deepDip, logs: [], activities: ["Cook something"], now: NOW });
    expect(rec.activityLabel.length).toBeGreaterThan(0);
  });

  it("integrates with a real journey read end-to-end", () => {
    const journey = assessJourney({ axis: { reward: 12, stress: 88 }, logs: [], now: NOW });
    const olderSocial = mk({ activityLabel: "Message a friend", timestamp: NOW - 30 * DAY_MS });
    const rec = recommendActivity({
      journey,
      logs: [olderSocial],
      activities: ["Message a friend", "Something fun"],
      now: NOW,
    });
    expect(["pleasure", "connection", "mastery"]).toContain(rec.category);
    expect(rec.rationale.length).toBeGreaterThan(0);
  });
});
