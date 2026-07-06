import { describe, it, expect } from "vitest";
import {
  computeMovementDay,
  dateKeyOffset,
  generateDemoSamples,
  localDateKey,
  MIN_BASELINE_DAYS,
  upsertSample,
  wakingFraction,
  weekStrip,
  type ActivitySample,
} from "./activity";

// Fixed "now": today at 14:00 local, so hour-of-day logic is deterministic.
const NOW = new Date(new Date().setHours(14, 0, 0, 0)).getTime();
const TODAY = localDateKey(NOW);

function hourSample(
  daysAgo: number,
  hour: number,
  steps: number,
  source: ActivitySample["source"] = "fitbit",
): ActivitySample {
  return { date: dateKeyOffset(NOW, daysAgo), hour, source, steps, fetchedAt: NOW };
}

function manualSample(daysAgo: number, level: number, hour = 12): ActivitySample {
  return {
    date: dateKeyOffset(NOW, daysAgo),
    hour,
    source: "manual",
    manualLevel: level,
    fetchedAt: NOW,
  };
}

/** N baseline days of hourly data (100 steps/hour, 8am–8pm) + today up to 2pm. */
function steadyHistory(days: number, todayStepsPerHour = 100): ActivitySample[] {
  const out: ActivitySample[] = [];
  for (let d = days; d >= 1; d--) {
    for (let h = 8; h <= 20; h++) out.push(hourSample(d, h, 100));
  }
  for (let h = 8; h <= 14; h++) out.push(hourSample(0, h, todayStepsPerHour));
  return out;
}

describe("upsertSample", () => {
  it("replaces a sensor sample by source+date+hour", () => {
    const a = hourSample(0, 10, 100);
    const next = upsertSample([a], hourSample(0, 10, 250));
    expect(next).toHaveLength(1);
    expect(next[0].steps).toBe(250);
  });

  it("keeps distinct hours as distinct samples", () => {
    const next = upsertSample([hourSample(0, 10, 100)], hourSample(0, 11, 100));
    expect(next).toHaveLength(2);
  });

  it("manual is one judgment per day — replaces regardless of hour", () => {
    const next = upsertSample([manualSample(0, 3, 9)], manualSample(0, 7, 18));
    expect(next).toHaveLength(1);
    expect(next[0].manualLevel).toBe(7);
  });
});

describe("computeMovementDay — no data / building baseline", () => {
  it("no samples at all → none, no score, empty hours", () => {
    const day = computeMovementDay([], NOW);
    expect(day.bucket).toBe("none");
    expect(day.score).toBeNull();
    expect(day.hours.every((h) => h === null)).toBe(true);
  });

  it("today's data shows live even before any baseline exists", () => {
    const day = computeMovementDay([hourSample(0, 9, 400), hourSample(0, 13, 900)], NOW);
    expect(day.bucket).toBe("none"); // not enough history to judge — so we don't
    expect(day.score).toBeNull();
    expect(day.totalSoFar).toBe(1300);
    expect(day.hours[9]).toBe(400);
    expect(day.peakHour).toBe(13);
  });

  it(`fewer than ${MIN_BASELINE_DAYS} baseline days → still no score`, () => {
    const day = computeMovementDay(steadyHistory(MIN_BASELINE_DAYS - 1), NOW);
    expect(day.score).toBeNull();
    expect(day.bucket).toBe("none");
    expect(day.baselineDays).toBe(MIN_BASELINE_DAYS - 1);
  });
});

describe("computeMovementDay — personal baseline scoring", () => {
  it("a typical day scores usual", () => {
    const day = computeMovementDay(steadyHistory(14, 100), NOW);
    expect(day.bucket).toBe("usual");
  });

  it("a much stiller day scores quiet — clamped, never runaway-negative", () => {
    const day = computeMovementDay(steadyHistory(14, 5), NOW);
    expect(day.bucket).toBe("quiet");
    expect(day.score).toBeGreaterThanOrEqual(-2);
  });

  it("a much livelier day scores lively — clamped", () => {
    const day = computeMovementDay(steadyHistory(14, 400), NOW);
    expect(day.bucket).toBe("lively");
    expect(day.score).toBeLessThanOrEqual(2);
  });

  it("compares against typical-day-up-to-this-hour, not full days (mornings can't fail)", () => {
    // Baseline days total 1300 steps (8am–8pm). Today has matched that pace
    // through 2pm — so it's "usual", even though the full-day total is bigger.
    const day = computeMovementDay(steadyHistory(14, 100), NOW);
    expect(day.totalSoFar).toBe(700); // 8am–2pm only
    expect(day.bucket).toBe("usual");
  });

  it("missing days are excluded from the baseline, not counted as zero", () => {
    // History with every other day missing entirely: baseline must still be
    // built only from real days, and a normal today reads usual (a zero-filled
    // baseline would make today look wildly lively).
    const out: ActivitySample[] = [];
    for (let d = 28; d >= 1; d -= 2) {
      for (let h = 8; h <= 20; h++) out.push(hourSample(d, h, 100));
    }
    for (let h = 8; h <= 14; h++) out.push(hourSample(0, h, 100));
    const day = computeMovementDay(out, NOW);
    expect(day.baselineDays).toBe(14);
    expect(day.bucket).toBe("usual");
  });

  it("zero-spread history (MAD = 0) still buckets sanely", () => {
    const day = computeMovementDay(steadyHistory(14, 100), NOW);
    expect(day.score).not.toBeNull();
    expect(Number.isFinite(day.score!)).toBe(true);
  });
});

describe("computeMovementDay — sources and units", () => {
  it("manual outranks a sensor on the same day", () => {
    const samples = [
      ...steadyHistory(14, 100),
      manualSample(0, 6), // the user's own judgment wins
    ];
    const day = computeMovementDay(samples, NOW);
    expect(day.source).toBe("manual");
    expect(day.unit).toBe("manualLevel");
  });

  it("baseline only uses same-unit days — manual days don't pollute a steps baseline", () => {
    const samples = [
      ...steadyHistory(14, 100),
      manualSample(3, 2), // a manual day inside the window (manual outranks fitbit that day)
    ];
    const day = computeMovementDay(samples, NOW);
    expect(day.unit).toBe("steps");
    expect(day.baselineDays).toBe(13); // the manual day dropped out, not zeroed in
    expect(day.bucket).toBe("usual");
  });

  it("manual-only tracking scores against manual history", () => {
    const samples: ActivitySample[] = [];
    for (let d = 10; d >= 1; d--) samples.push(manualSample(d, 5));
    samples.push(manualSample(0, 5));
    const day = computeMovementDay(samples, NOW);
    expect(day.unit).toBe("manualLevel");
    expect(day.score).not.toBeNull();
    // level 5 vs a history of 5s at 2pm (waking-curve scaled) → not quiet
    expect(day.bucket === "usual" || day.bucket === "lively").toBe(true);
  });
});

describe("wakingFraction", () => {
  it("is 0 before the day starts and 1 by night", () => {
    expect(wakingFraction(3)).toBe(0);
    expect(wakingFraction(23)).toBe(1);
  });
  it("rises through the day", () => {
    expect(wakingFraction(9)).toBeGreaterThan(wakingFraction(8));
    expect(wakingFraction(9)).toBeLessThan(1);
  });
});

describe("weekStrip", () => {
  it("renders missing days as null, never zero", () => {
    const samples = [hourSample(0, 9, 500), hourSample(2, 9, 300)];
    const strip = weekStrip(samples, NOW, 7);
    expect(strip).toHaveLength(7);
    expect(strip[6]).toEqual({ date: TODAY, total: 500 });
    expect(strip[4].total).toBe(300);
    expect(strip[5].total).toBeNull(); // yesterday: no data ≠ 0
  });
});

describe("generateDemoSamples", () => {
  it("fills history fully and today only up to the current hour", () => {
    const samples = generateDemoSamples(NOW, 10);
    const today = samples.filter((s) => s.date === TODAY);
    expect(Math.max(...today.map((s) => s.hour))).toBe(14);
    const yesterday = samples.filter((s) => s.date === dateKeyOffset(NOW, 1));
    expect(Math.max(...yesterday.map((s) => s.hour))).toBe(23);
  });

  it("is deterministic and produces a scoreable day", () => {
    const a = generateDemoSamples(NOW, 28);
    const b = generateDemoSamples(NOW, 28);
    expect(a).toEqual(b);
    const day = computeMovementDay(a, NOW);
    expect(day.score).not.toBeNull();
    expect(day.bucket).not.toBe("none");
  });
});
