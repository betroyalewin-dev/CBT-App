import { describe, it, expect } from "vitest";
import { nextRecheckAt, isRecheckDue, RECHECK_INTERVAL_DAYS } from "./recheck";
import { scorePHQ9 } from "./phq9";
import { DAY_MS } from "./dashboard";

const items = [1, 1, 1, 0, 0, 0, 0, 0, 0];

describe("nextRecheckAt", () => {
  it("is null with no history", () => {
    expect(nextRecheckAt([])).toBeNull();
  });

  it("is the interval after the most recent check-in", () => {
    const at = 1_000_000;
    const result = scorePHQ9(items, at);
    expect(nextRecheckAt([result])).toBe(at + RECHECK_INTERVAL_DAYS * DAY_MS);
  });

  it("uses the last entry when there's a history", () => {
    const first = scorePHQ9(items, 0);
    const second = scorePHQ9(items, 5 * DAY_MS);
    expect(nextRecheckAt([first, second])).toBe(
      5 * DAY_MS + RECHECK_INTERVAL_DAYS * DAY_MS,
    );
  });
});

describe("isRecheckDue", () => {
  it("is false with no history", () => {
    expect(isRecheckDue([], 999_999)).toBe(false);
  });

  it("is false before the interval elapses", () => {
    const result = scorePHQ9(items, 0);
    const almostDue = RECHECK_INTERVAL_DAYS * DAY_MS - 1;
    expect(isRecheckDue([result], almostDue)).toBe(false);
  });

  it("is true once the interval has elapsed", () => {
    const result = scorePHQ9(items, 0);
    const due = RECHECK_INTERVAL_DAYS * DAY_MS;
    expect(isRecheckDue([result], due)).toBe(true);
    expect(isRecheckDue([result], due + DAY_MS)).toBe(true);
  });
});
