import { describe, it, expect } from "vitest";
import {
  activityLedger,
  bestBets,
  effortWord,
  MOOD_CHECK_LABEL,
} from "./ledger";
import { DAY_MS } from "./dashboard";
import type { ActivityLog } from "./types";

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

const NOW = Date.now();

const good = (label: string) =>
  mk({ activityLabel: label, mood: { valence: 4, arousal: -2 }, pleasure: 8, mastery: 7 });
const dull = (label: string) =>
  mk({ activityLabel: label, mood: { valence: -2, arousal: 0 }, pleasure: 2, mastery: 2 });

describe("activityLedger", () => {
  it("aggregates per activity and sorts by worth", () => {
    const logs = [good("walk"), good("walk"), dull("scroll"), dull("scroll")];
    const { stats } = activityLedger(logs, NOW);
    expect(stats.map((s) => s.label)).toEqual(["walk", "scroll"]);
    expect(stats[0].n).toBe(2);
    expect(stats[0].benefit).toBeGreaterThan(stats[1].benefit);
  });

  it("mood checks feed the baseline but never appear as activities", () => {
    const logs = [good("walk"), good("walk"), dull(MOOD_CHECK_LABEL)];
    const ledger = activityLedger(logs, NOW);
    expect(ledger.stats.map((s) => s.label)).toEqual(["walk"]);
    // The dull mood check should have pulled the baseline below walk's benefit.
    expect(ledger.baseline).toBeLessThan(ledger.stats[0].benefit);
  });

  it("ignores logs outside the window", () => {
    const logs = [good("walk"), mk({ activityLabel: "old", timestamp: NOW - 40 * DAY_MS })];
    const { stats } = activityLedger(logs, NOW);
    expect(stats.map((s) => s.label)).toEqual(["walk"]);
  });

  it("computes mood lift against the user's overall baseline", () => {
    const logs = [good("walk"), good("walk"), dull("scroll"), dull("scroll")];
    const { stats } = activityLedger(logs, NOW);
    const walk = stats.find((s) => s.label === "walk")!;
    const scroll = stats.find((s) => s.label === "scroll")!;
    expect(walk.moodLift).toBeGreaterThan(0);
    expect(scroll.moodLift).toBeLessThan(0);
  });

  it("effort discounts worth; unrated effort stays null and undiscounted", () => {
    const logs = [
      good("hike"), good("hike"),
      good("read"), good("read"),
    ];
    logs[0].effort = 3;
    logs[1].effort = 3;
    const { stats } = activityLedger(logs, NOW);
    const hike = stats.find((s) => s.label === "hike")!;
    const read = stats.find((s) => s.label === "read")!;
    expect(hike.avgEffort).toBe(3);
    expect(read.avgEffort).toBeNull();
    // Same benefit, but heavy effort ranks hike below unrated read.
    expect(read.worth).toBeGreaterThan(hike.worth);
  });
});

describe("bestBets", () => {
  it("needs at least 2 logs of an activity", () => {
    const logs = [good("walk"), dull("scroll"), dull("scroll")];
    expect(bestBets(logs, NOW).map((s) => s.label)).not.toContain("walk");
  });

  it("only names activities meaningfully above the user's baseline", () => {
    // Everything identical → nothing beats baseline → no bets.
    const logs = [good("walk"), good("walk"), good("swim"), good("swim")];
    expect(bestBets(logs, NOW)).toEqual([]);
  });

  it("returns the standouts, capped at 3, best worth first", () => {
    const logs = [
      good("walk"), good("walk"),
      good("swim"), good("swim"),
      good("cook"), good("cook"),
      good("call"), good("call"),
      dull("scroll"), dull("scroll"), dull("scroll"), dull("scroll"),
    ];
    const bets = bestBets(logs, NOW);
    expect(bets.length).toBe(3);
    expect(bets.map((b) => b.label)).not.toContain("scroll");
    expect(bets[0].worth).toBeGreaterThanOrEqual(bets[2].worth);
  });

  it("prefers the lighter of two equally rewarding activities", () => {
    const logs = [
      good("hike"), good("hike"),
      good("read"), good("read"),
      dull("scroll"), dull("scroll"),
    ];
    logs[0].effort = 3;
    logs[1].effort = 3;
    logs[2].effort = 1;
    logs[3].effort = 1;
    const bets = bestBets(logs, NOW);
    expect(bets[0].label).toBe("read");
  });
});

describe("effortWord", () => {
  it("maps the 1–3 scale to words", () => {
    expect(effortWord(1)).toBe("light");
    expect(effortWord(1.4)).toBe("light");
    expect(effortWord(2)).toBe("medium");
    expect(effortWord(3)).toBe("heavy");
  });
});
