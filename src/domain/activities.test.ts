import { describe, it, expect } from "vitest";
import {
  categorize,
  isTrackableActivity,
  analyzeDeficiency,
  recommendActivity,
  CATEGORY_META,
} from "./activities";
import { assessJourney, type JourneySignal } from "./journey";
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
  it("maps known seed activities to one of the two levers", () => {
    expect(categorize("A favorite show")).toBe("pleasure");
    expect(categorize("Tidy a space")).toBe("mastery");
    expect(categorize("Cook something")).toBe("mastery");
  });
  it("uses keyword cues for custom labels", () => {
    expect(categorize("clean the kitchen")).toBe("mastery");
    expect(categorize("finish the report")).toBe("mastery");
    expect(categorize("watch a movie")).toBe("pleasure");
  });
  it("defaults unknown labels to the lower-pressure rung", () => {
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
  it("low pleasure ratings → high pleasure deficiency", () => {
    const logs = [
      mk({ activityLabel: "A favorite show", mastery: 7, pleasure: 1 }),
      mk({ activityLabel: "Read a few pages", mastery: 6, pleasure: 2 }),
    ];
    const d = analyzeDeficiency(logs, NOW);
    expect(d.pleasure).toBeGreaterThan(0.7);
    expect(d.mastery).toBeLessThan(d.pleasure);
  });
  it("neutral default when there are no usable logs", () => {
    const d = analyzeDeficiency([], NOW);
    expect(d).toEqual({ pleasure: 0.5, mastery: 0.5, sampleSize: 0 });
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

  it("recovered + low mastery recommends mastery", () => {
    const logs = [
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
      logs: [mk({ activityLabel: "A favorite show", mastery: 1 })],
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
    const rec = recommendActivity({
      journey,
      logs: [mk({ activityLabel: "A favorite show", pleasure: 6, mastery: 2 })],
      activities: ["A favorite show", "Cook something"],
      now: NOW,
    });
    expect(["pleasure", "mastery"]).toContain(rec.category);
    expect(rec.rationale.length).toBeGreaterThan(0);
  });
});
