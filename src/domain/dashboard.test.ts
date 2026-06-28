import { describe, it, expect } from "vitest";
import { computeDashboard, DAY_MS } from "./dashboard";
import { generateInsights } from "./insights";
import type { ActivityLog } from "./types";

function mk(over: Partial<ActivityLog>): ActivityLog {
  return {
    id: Math.random().toString(36).slice(2),
    timestamp: Date.now(),
    activityLabel: "check-in",
    mood: { valence: 0, arousal: 0 },
    pleasure: 5,
    mastery: 5,
    planned: false,
    ...over,
  };
}

const NOW = Date.now();

describe("computeDashboard", () => {
  it("no logs → no data, centered, defaults", () => {
    const d = computeDashboard([], NOW);
    expect(d.hasData).toBe(false);
    expect(d.axis).toEqual({ reward: 50, stress: 50 });
  });

  it("pleasant + calm recent logs → high reward, low stress → thriving", () => {
    const logs = [
      mk({ timestamp: NOW, mood: { valence: 5, arousal: -5 }, pleasure: 9, mastery: 8 }),
    ];
    const d = computeDashboard(logs, NOW);
    expect(d.hasData).toBe(true);
    expect(d.axis.reward).toBeGreaterThanOrEqual(50);
    expect(d.axis.stress).toBeLessThan(50);
    expect(d.quadrant).toBe("thriving");
  });

  it("unpleasant + activated → low reward, high stress → flat", () => {
    const logs = [
      mk({ timestamp: NOW, mood: { valence: -5, arousal: 5 }, pleasure: 1, mastery: 1 }),
    ];
    const d = computeDashboard(logs, NOW);
    expect(d.axis.reward).toBeLessThan(50);
    expect(d.axis.stress).toBeGreaterThanOrEqual(50);
    expect(d.quadrant).toBe("flat");
  });

  it("ignores logs outside the smoothing window", () => {
    const logs = [mk({ timestamp: NOW - 10 * DAY_MS })];
    expect(computeDashboard(logs, NOW, 3).hasData).toBe(false);
  });

  it("weights recent logs more than older ones", () => {
    const logs = [
      mk({ timestamp: NOW, mood: { valence: 5, arousal: 0 }, pleasure: 10, mastery: 10 }),
      mk({ timestamp: NOW - 2.5 * DAY_MS, mood: { valence: -5, arousal: 0 }, pleasure: 0, mastery: 0 }),
    ];
    const d = computeDashboard(logs, NOW, 3);
    // Today's strong-reward log should dominate the faded older one.
    expect(d.axis.reward).toBeGreaterThan(50);
  });
});

describe("generateInsights", () => {
  it("returns nothing with too little data", () => {
    expect(generateInsights([mk({})], NOW)).toEqual([]);
  });

  it("flags an activity whose mood runs above baseline as a lever to test", () => {
    const logs = [
      mk({ activityLabel: "walk", mood: { valence: 4, arousal: 0 } }),
      mk({ activityLabel: "walk", mood: { valence: 4, arousal: 0 } }),
      mk({ activityLabel: "scroll", mood: { valence: -2, arousal: 0 } }),
      mk({ activityLabel: "scroll", mood: { valence: -2, arousal: 0 } }),
    ];
    const ids = generateInsights(logs, NOW).map((i) => i.id);
    expect(ids).toContain("lever:walk");
  });

  it("never claims proof — wording stays hedged", () => {
    const logs = [
      mk({ activityLabel: "walk", mood: { valence: 5, arousal: 0 } }),
      mk({ activityLabel: "walk", mood: { valence: 5, arousal: 0 } }),
      mk({ activityLabel: "x", mood: { valence: -3, arousal: 0 } }),
    ];
    const lever = generateInsights(logs, NOW).find((i) => i.kind === "lever");
    expect(lever?.text.toLowerCase()).toMatch(/worth testing|not proof|small sample/);
  });

  it("surfaces a mastery gap when mood is okay but mastery is near zero", () => {
    const logs = [
      mk({ mood: { valence: 2, arousal: 0 }, mastery: 1 }),
      mk({ mood: { valence: 1, arousal: 0 }, mastery: 0 }),
      mk({ mood: { valence: 2, arousal: 0 }, mastery: 2 }),
    ];
    expect(generateInsights(logs, NOW).some((i) => i.kind === "mastery-gap")).toBe(true);
  });
});
