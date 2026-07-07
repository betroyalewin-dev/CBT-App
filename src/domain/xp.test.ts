import { describe, it, expect } from "vitest";
import {
  XP,
  levelFloor,
  levelFromXp,
  awardForLog,
  awardForPhq9,
  sumAward,
} from "./xp";
import type { PHQ9Result } from "./types";

function phq(total: number): PHQ9Result {
  return {
    items: [],
    total,
    severity: "mild",
    item9: 0,
    safetyFlag: false,
    at: 0,
  };
}

describe("level curve", () => {
  it("level floors widen gradually and start at zero", () => {
    expect(levelFloor(1)).toBe(0);
    expect(levelFloor(2)).toBe(60);
    expect(levelFloor(3)).toBe(180);
    expect(levelFloor(2) - levelFloor(1)).toBeLessThan(
      levelFloor(3) - levelFloor(2),
    );
  });

  it("maps xp to the right level and progress", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(59).level).toBe(1);
    expect(levelFromXp(60).level).toBe(2);
    expect(levelFromXp(180).level).toBe(3);
  });

  it("progress is 0..1 within a level and toNext is never negative", () => {
    const info = levelFromXp(120); // halfway through L2 (60→180)
    expect(info.level).toBe(2);
    expect(info.progress).toBeCloseTo(0.5, 5);
    expect(info.toNext).toBe(60);
    expect(levelFromXp(10_000).toNext).toBeGreaterThanOrEqual(0);
  });

  it("handles negative / fractional xp defensively", () => {
    expect(levelFromXp(-5).level).toBe(1);
    expect(levelFromXp(12.9).into).toBe(12);
  });
});

describe("awards", () => {
  it("every log earns the same base regardless of mood", () => {
    expect(sumAward(awardForLog(false))).toBe(XP.log);
  });

  it("a planned follow-through adds a bonus on top of the base", () => {
    const items = awardForLog(true);
    expect(sumAward(items)).toBe(XP.log + XP.planned);
    expect(items).toHaveLength(2);
  });

  it("rewards a PHQ-9 that improved (came down)", () => {
    expect(sumAward(awardForPhq9(phq(14), phq(9)))).toBe(XP.phq9Improved);
  });

  it("never penalises a worse or first PHQ-9 — just no bonus", () => {
    expect(awardForPhq9(phq(9), phq(14))).toHaveLength(0);
    expect(awardForPhq9(undefined, phq(9))).toHaveLength(0);
    expect(awardForPhq9(phq(9), phq(9))).toHaveLength(0);
  });
});
