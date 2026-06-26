import { describe, it, expect } from "vitest";
import { computeStreak } from "./streak";
import { DAY_MS } from "./dashboard";
import type { ActivityLog } from "./types";

const NOON = 12 * 60 * 60 * 1000; // avoid TZ edge at midnight
function logOnDay(daysAgo: number, now: number): ActivityLog {
  return {
    id: `l${daysAgo}`,
    timestamp: now - daysAgo * DAY_MS,
    activityLabel: "check-in",
    mood: { valence: 0, arousal: 0 },
    pleasure: 5,
    mastery: 5,
    planned: false,
  };
}

const NOW = Math.floor(Date.now() / DAY_MS) * DAY_MS + NOON;

describe("computeStreak", () => {
  it("empty → new", () => {
    expect(computeStreak([], NOW)).toEqual({
      days: 0,
      status: "new",
      graceUsed: false,
    });
  });

  it("logged today and the two days before → 3", () => {
    const logs = [logOnDay(0, NOW), logOnDay(1, NOW), logOnDay(2, NOW)];
    const s = computeStreak(logs, NOW);
    expect(s.days).toBe(3);
    expect(s.status).toBe("active");
    expect(s.graceUsed).toBe(false);
  });

  it("forgives a single missed day (grace), keeps the run alive", () => {
    // today, (skip 1), day 2, day 3
    const logs = [logOnDay(0, NOW), logOnDay(2, NOW), logOnDay(3, NOW)];
    const s = computeStreak(logs, NOW);
    expect(s.status).toBe("active");
    expect(s.graceUsed).toBe(true);
    expect(s.days).toBe(3);
  });

  it("two missed days in a row → welcome back, never a broken-streak scolding", () => {
    const logs = [logOnDay(3, NOW), logOnDay(4, NOW)];
    const s = computeStreak(logs, NOW);
    expect(s.status).toBe("welcome-back");
    expect(s.days).toBe(0);
  });

  it("counts a run that ended yesterday (today not yet logged)", () => {
    const logs = [logOnDay(1, NOW), logOnDay(2, NOW)];
    const s = computeStreak(logs, NOW);
    expect(s.status).toBe("active");
    expect(s.days).toBe(2);
  });
});
