import { describe, it, expect } from "vitest";
import { scorePHQ9, phq9Severity, PHQ9_ITEMS } from "./phq9";

describe("phq9Severity", () => {
  it("maps totals to the validated bands", () => {
    expect(phq9Severity(0)).toBe("minimal");
    expect(phq9Severity(4)).toBe("minimal");
    expect(phq9Severity(5)).toBe("mild");
    expect(phq9Severity(9)).toBe("mild");
    expect(phq9Severity(10)).toBe("moderate");
    expect(phq9Severity(14)).toBe("moderate");
    expect(phq9Severity(15)).toBe("moderately severe");
    expect(phq9Severity(19)).toBe("moderately severe");
    expect(phq9Severity(20)).toBe("severe");
    expect(phq9Severity(27)).toBe("severe");
  });
});

describe("scorePHQ9", () => {
  it("has 9 canonical items", () => {
    expect(PHQ9_ITEMS).toHaveLength(9);
  });

  it("sums items and assigns severity", () => {
    const r = scorePHQ9([1, 1, 1, 1, 1, 1, 1, 1, 0]);
    expect(r.total).toBe(8);
    expect(r.severity).toBe("mild");
  });

  it("raises the safety flag when item 9 is positive", () => {
    const r = scorePHQ9([0, 0, 0, 0, 0, 0, 0, 0, 1]);
    expect(r.item9).toBe(1);
    expect(r.safetyFlag).toBe(true);
  });

  it("does not raise the safety flag when item 9 is zero, even at high totals", () => {
    const r = scorePHQ9([3, 3, 3, 3, 3, 3, 3, 3, 0]);
    expect(r.total).toBe(24);
    expect(r.severity).toBe("severe");
    expect(r.safetyFlag).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(() => scorePHQ9([1, 2, 3])).toThrow();
    expect(() => scorePHQ9([0, 0, 0, 0, 0, 0, 0, 0, 4])).toThrow();
    expect(() => scorePHQ9([0, 0, 0, 0, 0, 0, 0, 0, -1])).toThrow();
  });
});
