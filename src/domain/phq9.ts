import type { PHQ9Result, PHQ9Severity } from "./types";

/** The 9 PHQ-9 item prompts (validated depression screen). */
export const PHQ9_ITEMS: string[] = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure, or have let yourself or your family down",
  "Trouble concentrating on things, such as reading or watching TV",
  "Moving or speaking so slowly that other people could have noticed — or being so fidgety or restless that you have been moving a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

export const PHQ9_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

export function phq9Severity(total: number): PHQ9Severity {
  if (total <= 4) return "minimal";
  if (total <= 9) return "mild";
  if (total <= 14) return "moderate";
  if (total <= 19) return "moderately severe";
  return "severe";
}

/**
 * Score a completed PHQ-9. `items` must be 9 values, each 0–3.
 * Item 9 (index 8) is self-harm: any non-zero answer raises the safety flag.
 */
export function scorePHQ9(items: number[], at: number = Date.now()): PHQ9Result {
  if (items.length !== 9) {
    throw new Error(`PHQ-9 needs exactly 9 items, got ${items.length}`);
  }
  for (const v of items) {
    if (!Number.isInteger(v) || v < 0 || v > 3) {
      throw new Error(`PHQ-9 item out of range: ${v}`);
    }
  }
  const total = items.reduce((a, b) => a + b, 0);
  const item9 = items[8];
  return {
    items: [...items],
    total,
    severity: phq9Severity(total),
    item9,
    safetyFlag: item9 > 0,
    at,
  };
}
