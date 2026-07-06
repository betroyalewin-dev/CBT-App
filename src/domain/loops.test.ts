import { describe, it, expect } from "vitest";
import { assessLoops } from "./loops";
import { DAY_MS } from "./dashboard";
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

describe("assessLoops", () => {
  it("no data with too few logs", () => {
    expect(assessLoops([mk({}), mk({})], NOW).hasData).toBe(false);
  });

  it("no data with no recent logs", () => {
    const logs = [
      mk({ timestamp: NOW - 30 * DAY_MS }),
      mk({ timestamp: NOW - 31 * DAY_MS }),
      mk({ timestamp: NOW - 32 * DAY_MS }),
    ];
    expect(assessLoops(logs, NOW).hasData).toBe(false);
  });

  it("flat, low-reward week → withdrawal leads", () => {
    const logs = Array.from({ length: 5 }, (_, i) =>
      mk({
        timestamp: NOW - i * DAY_MS,
        mood: { valence: -3, arousal: -3 },
        pleasure: 1,
        mastery: 1,
      }),
    );
    const a = assessLoops(logs, NOW);
    expect(a.hasData).toBe(true);
    expect(a.primary).toBe("withdrawal");
  });

  it("agitated, high-stress week → overwhelm leads", () => {
    const logs = Array.from({ length: 5 }, (_, i) =>
      mk({
        timestamp: NOW - i * DAY_MS,
        mood: { valence: -3, arousal: 4 },
        pleasure: 3,
        mastery: 3,
      }),
    );
    const a = assessLoops(logs, NOW);
    expect(a.hasData).toBe(true);
    expect(a.primary).toBe("overwhelm");
  });

  it("logging drops off after a negative log, following a steady prior week → avoidance rises", () => {
    const prior = Array.from({ length: 7 }, (_, i) =>
      mk({ timestamp: NOW - (8 + i) * DAY_MS, mood: { valence: 1, arousal: 0 } }),
    );
    const recent = [mk({ timestamp: NOW - 6 * DAY_MS, mood: { valence: -4, arousal: 1 } })];
    const a = assessLoops([...prior, ...recent], NOW);
    expect(a.hasData).toBe(true);
    const avoidance = a.scores.find((s) => s.key === "avoidance")!.score;
    expect(avoidance).toBeGreaterThan(30);
  });

  it("flat mood logs with notes attached → rumination rises", () => {
    const logs = Array.from({ length: 5 }, (_, i) =>
      mk({
        timestamp: NOW - i * DAY_MS,
        mood: { valence: -2, arousal: -2 },
        note: "replaying the conversation again, feeling like an idiot",
      }),
    );
    const a = assessLoops(logs, NOW);
    const rumination = a.scores.find((s) => s.key === "rumination")!.score;
    expect(rumination).toBeGreaterThan(50);
  });

  it("scores are independent, not forced to sum to 100", () => {
    const logs = Array.from({ length: 5 }, (_, i) =>
      mk({ timestamp: NOW - i * DAY_MS, mood: { valence: -4, arousal: 4 }, pleasure: 0, mastery: 0 }),
    );
    const a = assessLoops(logs, NOW);
    const sum = a.scores.reduce((s, x) => s + x.score, 0);
    expect(sum === 100).toBe(false);
  });

  it("surfaces a secondary loop when the runner-up is close behind", () => {
    // A mix of flat and agitated low-reward days pulls withdrawal and
    // overwhelm up together, rather than one dominating.
    const logs = [
      ...Array.from({ length: 3 }, (_, i) =>
        mk({
          timestamp: NOW - i * DAY_MS,
          mood: { valence: -2, arousal: -2 },
          pleasure: 2,
          mastery: 2,
        }),
      ),
      ...Array.from({ length: 2 }, (_, i) =>
        mk({
          timestamp: NOW - (i + 3) * DAY_MS,
          mood: { valence: -2, arousal: 3 },
          pleasure: 2,
          mastery: 2,
        }),
      ),
    ];
    const a = assessLoops(logs, NOW);
    expect(a.primary).toBe("withdrawal");
    expect(a.secondary).toBe("overwhelm");
  });
});
