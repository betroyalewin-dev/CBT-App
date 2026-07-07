import { describe, it, expect } from "vitest";
import { recentPlanOutcome, planAge, type ActivityPlan } from "./plan";
import { DAY_MS } from "./dashboard";
import type { ActivityLog } from "./types";

const NOW = Date.now();

function mk(over: Partial<ActivityLog>): ActivityLog {
  return {
    id: Math.random().toString(36).slice(2),
    timestamp: NOW,
    activityLabel: "walk",
    mood: { valence: 0, arousal: 0 },
    pleasure: 5,
    mastery: 5,
    planned: false,
    ...over,
  };
}

describe("recentPlanOutcome", () => {
  it("returns null when no planned log with a forecast exists", () => {
    expect(recentPlanOutcome([mk({})], NOW)).toBeNull();
    expect(recentPlanOutcome([mk({ planned: true })], NOW)).toBeNull();
  });

  it("reads forecast vs reality off the most recent planned log", () => {
    const logs = [
      mk({ planned: true, anticipated: { pleasure: 3 }, pleasure: 7, timestamp: NOW - 1000 }),
    ];
    const out = recentPlanOutcome(logs, NOW)!;
    expect(out.predicted).toBe(3);
    expect(out.actual).toBe(7);
    expect(out.delta).toBe(4);
  });

  it("ignores planned logs older than the window", () => {
    const logs = [
      mk({ planned: true, anticipated: { pleasure: 3 }, timestamp: NOW - 2 * DAY_MS }),
    ];
    expect(recentPlanOutcome(logs, NOW)).toBeNull();
  });

  it("picks the latest planned log when several qualify", () => {
    const logs = [
      mk({ planned: true, anticipated: { pleasure: 2 }, pleasure: 2, timestamp: NOW - 5000 }),
      mk({ planned: true, anticipated: { pleasure: 6 }, pleasure: 8, timestamp: NOW - 1000 }),
    ];
    expect(recentPlanOutcome(logs, NOW)!.predicted).toBe(6);
  });
});

describe("planAge", () => {
  const plan = (at: number): ActivityPlan => ({
    id: "p",
    activityLabel: "walk",
    predictedPleasure: 5,
    at,
  });

  it("describes plan age warmly", () => {
    expect(planAge(plan(NOW), NOW)).toBe("today");
    expect(planAge(plan(NOW - DAY_MS), NOW)).toBe("yesterday");
    expect(planAge(plan(NOW - 3 * DAY_MS), NOW)).toBe("a few days ago");
  });
});
