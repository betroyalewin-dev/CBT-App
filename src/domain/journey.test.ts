import { describe, it, expect } from "vitest";
import {
  assessJourney,
  onboardingRecovery,
  loggedRecovery,
} from "./journey";
import { DAY_MS } from "./dashboard";
import { scorePHQ9 } from "./phq9";
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
const severePhq9 = scorePHQ9([3, 3, 3, 3, 2, 3, 2, 2, 0]); // total 21
const minimalPhq9 = scorePHQ9([0, 0, 1, 0, 0, 0, 0, 0, 0]); // total 1

describe("onboardingRecovery", () => {
  it("low reward + high stress + severe PHQ-9 → low recovery", () => {
    expect(onboardingRecovery({ reward: 15, stress: 85 }, severePhq9)).toBeLessThan(30);
  });
  it("high reward + low stress + minimal PHQ-9 → high recovery", () => {
    expect(onboardingRecovery({ reward: 85, stress: 15 }, minimalPhq9)).toBeGreaterThan(75);
  });
  it("works without a PHQ-9 (reward still dominates)", () => {
    expect(onboardingRecovery({ reward: 90, stress: 10 })).toBeGreaterThan(75);
  });
});

describe("loggedRecovery", () => {
  it("null when there are no logs", () => {
    expect(loggedRecovery([])).toBeNull();
  });
  it("pleasant, calm, rewarding logs → high", () => {
    const r = loggedRecovery([
      mk({ mood: { valence: 5, arousal: -4 }, pleasure: 9, mastery: 8 }),
    ]);
    expect(r).toBeGreaterThan(70);
  });
  it("unpleasant, activated, flat logs → low", () => {
    const r = loggedRecovery([
      mk({ mood: { valence: -5, arousal: 5 }, pleasure: 1, mastery: 1 }),
    ]);
    expect(r).toBeLessThan(30);
  });
});

describe("assessJourney", () => {
  it("day one (no logs): rides on onboarding, logWeight 0", () => {
    const j = assessJourney({ axis: { reward: 15, stress: 85 }, phq9: severePhq9, logs: [] });
    expect(j.logWeight).toBe(0);
    expect(j.stage).toBe("stabilizing");
    expect(j.recovery).toBeLessThan(30);
  });

  it("deep dip → high pleasure bias (build momentum with easy wins)", () => {
    const j = assessJourney({ axis: { reward: 10, stress: 90 }, phq9: severePhq9, logs: [] });
    expect(j.pleasureBias).toBeGreaterThan(0.7);
  });

  it("steady → low pleasure bias (lean into mastery)", () => {
    const j = assessJourney({ axis: { reward: 90, stress: 10 }, phq9: minimalPhq9, logs: [] });
    expect(j.stage).toBe("steady");
    expect(j.pleasureBias).toBeLessThan(0.45);
  });

  it("pleasure bias is monotonic: lower recovery → higher bias", () => {
    const low = assessJourney({ axis: { reward: 20, stress: 80 }, logs: [] });
    const high = assessJourney({ axis: { reward: 80, stress: 20 }, logs: [] });
    expect(low.pleasureBias).toBeGreaterThan(high.pleasureBias);
  });

  it("pleasure bias stays within its band", () => {
    const j = assessJourney({ axis: { reward: 0, stress: 100 }, phq9: severePhq9, logs: [] });
    expect(j.pleasureBias).toBeLessThanOrEqual(0.85);
    expect(j.pleasureBias).toBeGreaterThanOrEqual(0.25);
  });

  it("a wall of good recent logs lifts a pessimistic intake (living read)", () => {
    const goodLogs = Array.from({ length: 14 }, (_, i) =>
      mk({
        timestamp: NOW - i * (DAY_MS / 3),
        mood: { valence: 4, arousal: -3 },
        pleasure: 8,
        mastery: 7,
      }),
    );
    const frozen = assessJourney({ axis: { reward: 15, stress: 85 }, phq9: severePhq9, logs: [], now: NOW });
    const living = assessJourney({ axis: { reward: 15, stress: 85 }, phq9: severePhq9, logs: goodLogs, now: NOW });
    expect(living.logWeight).toBeGreaterThan(0.5);
    expect(living.recovery).toBeGreaterThan(frozen.recovery + 15);
  });

  it("only counts recent logs toward logWeight", () => {
    const stale = Array.from({ length: 14 }, (_, i) =>
      mk({ timestamp: NOW - (30 + i) * DAY_MS }),
    );
    const j = assessJourney({ axis: { reward: 50, stress: 50 }, logs: stale, now: NOW });
    // Falls back to last 10 logs, but they're old — still produces a read, just
    // not the "full trust" weight of 14 fresh entries.
    expect(j.logWeight).toBeLessThan(0.7);
  });
});
