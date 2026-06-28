import { describe, it, expect } from "vitest";
import {
  acclimation,
  isAcclimated,
  evaluateExperiment,
  readExperiment,
  ACCLIMATION_MIN_LOGS,
  type Experiment,
} from "./experiments";
import { DAY_MS } from "./dashboard";
import type { ActivityLog, MoodPoint } from "./types";

const T0 = new Date("2026-01-01T09:00:00").getTime();

function log(
  dayOffset: number,
  label: string,
  mood: Partial<MoodPoint> & { mastery?: number; pleasure?: number } = {},
): ActivityLog {
  return {
    id: `${dayOffset}-${label}-${Math.random()}`,
    timestamp: T0 + dayOffset * DAY_MS,
    activityLabel: label,
    mood: { valence: mood.valence ?? 0, arousal: mood.arousal ?? 0 },
    pleasure: mood.pleasure ?? 5,
    mastery: mood.mastery ?? 5,
    planned: false,
  };
}

describe("acclimation gate", () => {
  it("is not ready on day one no matter how many logs", () => {
    const logs = Array.from({ length: 6 }, (_, i) => log(0, `a${i}`));
    expect(isAcclimated(logs)).toBe(false);
    expect(acclimation(logs).daysToGo).toBe(1);
  });

  it("needs both distinct days and a minimum number of logs", () => {
    const twoDaysFewLogs = [log(0, "a"), log(1, "b")];
    expect(isAcclimated(twoDaysFewLogs)).toBe(false);
    expect(acclimation(twoDaysFewLogs).logsToGo).toBe(ACCLIMATION_MIN_LOGS - 2);
  });

  it("unlocks once a couple of days and enough logs accumulate", () => {
    const logs = [log(0, "a"), log(0, "b"), log(1, "c"), log(1, "d")];
    expect(isAcclimated(logs)).toBe(true);
    expect(acclimation(logs).ready).toBe(true);
  });
});

describe("experiment evaluation", () => {
  const exp: Experiment = {
    id: "e1",
    activityLabel: "A short walk",
    metric: "mood",
    hypothesis: "does a short walk lift my mood?",
    startedAt: T0,
    days: 14,
  };

  it("splits in-window logs into with/without the lever and contrasts them", () => {
    const logs = [
      log(0, "A short walk", { valence: 3 }),
      log(1, "A short walk", { valence: 2 }),
      log(2, "Doomscroll", { valence: -1 }),
      log(3, "Doomscroll", { valence: -2 }),
    ];
    const r = evaluateExperiment(exp, logs, T0 + 4 * DAY_MS);
    expect(r.withN).toBe(2);
    expect(r.withoutN).toBe(2);
    expect(r.withMean).toBeCloseTo(2.5);
    expect(r.withoutMean).toBeCloseTo(-1.5);
    expect(r.delta).toBeCloseTo(4);
    expect(r.hasEnough).toBe(true);
  });

  it("ignores logs outside the experiment window", () => {
    const logs = [
      log(-1, "A short walk", { valence: 5 }), // before start
      log(0, "A short walk", { valence: 1 }),
      log(99, "A short walk", { valence: 5 }), // after end
    ];
    const r = evaluateExperiment(exp, logs, T0 + 99 * DAY_MS);
    expect(r.withN).toBe(1);
  });

  it("marks done only once the window has fully elapsed", () => {
    expect(evaluateExperiment(exp, [], T0 + 5 * DAY_MS).done).toBe(false);
    expect(evaluateExperiment(exp, [], T0 + 14 * DAY_MS).done).toBe(true);
  });

  it("reads a thin sample as a hypothesis, not proof", () => {
    const r = evaluateExperiment(exp, [log(0, "A short walk")], T0 + DAY_MS);
    expect(readExperiment(exp, r)).toMatch(/not enough/i);
  });

  it("hedges even a strong contrast", () => {
    const logs = [
      log(0, "A short walk", { valence: 4 }),
      log(1, "A short walk", { valence: 4 }),
      log(2, "Chores", { valence: -2 }),
      log(3, "Chores", { valence: -2 }),
    ];
    const r = evaluateExperiment(exp, logs, T0 + 4 * DAY_MS);
    expect(readExperiment(exp, r)).toMatch(/hunch|not proof/i);
  });
});
