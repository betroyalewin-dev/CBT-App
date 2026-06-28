import { describe, it, expect } from "vitest";
import { scoreAxisPlacement, AXIS_ITEMS } from "./axis";
import { assignProfile } from "./profiles";

describe("scoreAxisPlacement", () => {
  it("all-zero answers → full reward, no stress", () => {
    expect(scoreAxisPlacement([0, 0, 0, 0, 0, 0])).toEqual({
      reward: 100,
      stress: 0,
    });
  });

  it("max anhedonia → reward floor; max load → stress ceiling", () => {
    expect(scoreAxisPlacement([3, 3, 3, 3, 3, 3])).toEqual({
      reward: 0,
      stress: 100,
    });
  });

  it("mixes the two axes independently", () => {
    // reward items maxed (anhedonia high → reward 0), stress items zero
    const r = scoreAxisPlacement([3, 3, 3, 0, 0, 0]);
    expect(r.reward).toBe(0);
    expect(r.stress).toBe(0);
  });

  it("rejects wrong length / out of range", () => {
    expect(() => scoreAxisPlacement([0, 0])).toThrow();
    expect(() => scoreAxisPlacement([0, 0, 0, 0, 0, 9])).toThrow();
  });

  it("has 6 items split across both axes", () => {
    expect(AXIS_ITEMS).toHaveLength(6);
    expect(AXIS_ITEMS.filter((i) => i.axis === "reward")).toHaveLength(3);
    expect(AXIS_ITEMS.filter((i) => i.axis === "stress")).toHaveLength(3);
  });
});

describe("assignProfile", () => {
  it("low reward + high stress → both", () => {
    expect(assignProfile({ reward: 20, stress: 80 })).toBe("both");
  });
  it("low reward + low stress → numb", () => {
    expect(assignProfile({ reward: 20, stress: 10 })).toBe("numb");
  });
  it("high reward + high stress → drowning", () => {
    expect(assignProfile({ reward: 80, stress: 80 })).toBe("drowning");
  });
  it("high reward + low stress → mild", () => {
    expect(assignProfile({ reward: 80, stress: 10 })).toBe("mild");
  });
});
