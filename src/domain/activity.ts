// Movement module domain layer (see ACTIVITY_SCORE.md).
//
// Deliberately decoupled from the BA model: nothing here touches mood,
// P/M, the reward axis, or XP. The module's job is the passive check-in
// loop — a live intraday picture plus a personal-baseline "vs your usual"
// bucket. Core honesty rules encoded here:
//   - missing data is missing (null), never zero
//   - baselines are the user's own days, same unit only — no norms
//   - intraday comparison is vs the user's typical day *up to this hour*
//   - coarse buckets (quiet · usual · lively), never a precise grade

export type ActivitySourceId =
  | "manual"
  | "whoop"
  | "fitbit"
  | "oura"
  | "healthkit"
  | "health-connect"
  | "demo";

/** User outranks sensors; demo (sample data) ranks below everything real. */
export const SOURCE_PRIORITY: ActivitySourceId[] = [
  "manual",
  "whoop",
  "fitbit",
  "oura",
  "healthkit",
  "health-connect",
  "demo",
];

export type MovementUnit = "steps" | "activeMinutes" | "manualLevel";

/** One hour bucket from one source. Manual entries are one-per-day. */
export interface ActivitySample {
  date: string; // local YYYY-MM-DD
  hour: number; // 0–23 (for manual: the hour it was recorded)
  source: ActivitySourceId;
  steps?: number;
  activeMinutes?: number;
  manualLevel?: number; // 0–10, "moved so far today"
  fetchedAt: number; // epoch ms
}

export interface ActivitySourceConn {
  id: ActivitySourceId;
  connectedAt: number;
}

export type MovementBucket = "quiet" | "usual" | "lively" | "none";

export interface MovementDay {
  date: string;
  source: ActivitySourceId | null;
  unit: MovementUnit | null;
  /** Intraday values by hour; null = no data for that hour. */
  hours: (number | null)[];
  totalSoFar: number;
  /** MAD units vs the user's typical day up to this hour; null until baseline exists. */
  score: number | null;
  bucket: MovementBucket;
  /** How many same-unit days informed the baseline. */
  baselineDays: number;
  /** Today's most active hour so far, if anything registered. */
  peakHour: number | null;
}

export const BASELINE_WINDOW_DAYS = 28;
export const MIN_BASELINE_DAYS = 7;
const SCORE_CLAMP = 2;
const BUCKET_EDGE = 0.75; // |score| beyond this → quiet / lively

// ── date helpers ──────────────────────────────────────────────────────

export function localDateKey(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Date key `offset` days before the given timestamp's local day. */
export function dateKeyOffset(ts: number, offset: number): string {
  const d = new Date(ts);
  d.setDate(d.getDate() - offset);
  return localDateKey(d.getTime());
}

// ── sample plumbing ───────────────────────────────────────────────────

export function sampleValue(
  s: ActivitySample,
): { unit: MovementUnit; value: number } | null {
  if (s.steps != null) return { unit: "steps", value: s.steps };
  if (s.activeMinutes != null) return { unit: "activeMinutes", value: s.activeMinutes };
  if (s.manualLevel != null) return { unit: "manualLevel", value: s.manualLevel };
  return null;
}

/**
 * Insert/replace a sample. Sensor samples replace by (source, date, hour);
 * manual is one judgment per day, so it replaces by (source, date).
 */
export function upsertSample(
  samples: ActivitySample[],
  sample: ActivitySample,
): ActivitySample[] {
  const matches = (s: ActivitySample) =>
    s.source === sample.source &&
    s.date === sample.date &&
    (sample.source === "manual" || s.hour === sample.hour);
  const idx = samples.findIndex(matches);
  if (idx === -1) return [...samples, sample];
  const next = samples.slice();
  next[idx] = sample;
  return next;
}

interface DayDetail {
  source: ActivitySourceId;
  unit: MovementUnit;
  hours: (number | null)[]; // 24
  total: number;
}

/** One canonical source per day — no cross-device merging (false precision). */
function canonicalDay(daySamples: ActivitySample[]): DayDetail | null {
  let best: ActivitySourceId | null = null;
  for (const s of daySamples) {
    if (sampleValue(s) === null) continue;
    if (
      best === null ||
      SOURCE_PRIORITY.indexOf(s.source) < SOURCE_PRIORITY.indexOf(best)
    ) {
      best = s.source;
    }
  }
  if (best === null) return null;

  const hours: (number | null)[] = Array.from({ length: 24 }, () => null);
  let unit: MovementUnit | null = null;
  let total = 0;
  for (const s of daySamples) {
    if (s.source !== best) continue;
    const v = sampleValue(s);
    if (!v) continue;
    unit = unit ?? v.unit;
    if (v.unit !== unit) continue; // a source stays in one unit
    hours[s.hour] = (hours[s.hour] ?? 0) + v.value;
    total += v.value;
  }
  if (unit === null) return null;
  return { source: best, unit, hours, total };
}

function groupByDate(samples: ActivitySample[]): Map<string, ActivitySample[]> {
  const map = new Map<string, ActivitySample[]>();
  for (const s of samples) {
    const list = map.get(s.date);
    if (list) list.push(s);
    else map.set(s.date, [s]);
  }
  return map;
}

// ── baseline math ─────────────────────────────────────────────────────

function median(xs: number[]): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Trimmed median: drop the top/bottom ~10% before taking the median. */
function trimmedMedian(xs: number[]): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.1);
  const inner = sorted.slice(trim, sorted.length - trim || sorted.length);
  return median(inner);
}

function mad(xs: number[], center: number): number {
  return median(xs.map((x) => Math.abs(x - center)));
}

/**
 * Manual days have no hourly detail, so approximate "how much of a typical
 * day has happened by hour h" with a fixed waking-day curve (nothing before
 * 7am, complete by 10pm). Keeps manual mornings from reading as failure.
 */
export function wakingFraction(hour: number): number {
  return Math.min(1, Math.max(0, (hour + 1 - 7) / 15));
}

/** A baseline day's value "at this hour": real cumulative when hourly, curve-scaled otherwise. */
function valueAtHour(day: DayDetail, hour: number): number {
  const hourly = day.hours.filter((h) => h !== null).length > 1;
  if (!hourly) return day.total * wakingFraction(hour);
  let sum = 0;
  for (let h = 0; h <= hour; h++) sum += day.hours[h] ?? 0;
  return sum;
}

// ── the main computation ──────────────────────────────────────────────

export function computeMovementDay(
  samples: ActivitySample[],
  now: number = Date.now(),
): MovementDay {
  const todayKey = localDateKey(now);
  const hourNow = new Date(now).getHours();
  const byDate = groupByDate(samples);
  const today = byDate.has(todayKey) ? canonicalDay(byDate.get(todayKey)!) : null;

  const empty: MovementDay = {
    date: todayKey,
    source: null,
    unit: null,
    hours: Array.from({ length: 24 }, () => null),
    totalSoFar: 0,
    score: null,
    bucket: "none",
    baselineDays: 0,
    peakHour: null,
  };
  if (!today) return empty;

  // Baseline: the most recent same-unit days before today, missing days
  // simply absent (never zero). Look back twice the window to ride out gaps.
  const baseline: DayDetail[] = [];
  for (let offset = 1; offset <= BASELINE_WINDOW_DAYS * 2; offset++) {
    if (baseline.length >= BASELINE_WINDOW_DAYS) break;
    const key = dateKeyOffset(now, offset);
    const daySamples = byDate.get(key);
    if (!daySamples) continue;
    const detail = canonicalDay(daySamples);
    if (detail && detail.unit === today.unit) baseline.push(detail);
  }

  let peakHour: number | null = null;
  let peakVal = 0;
  today.hours.forEach((v, h) => {
    if (v !== null && v > peakVal) {
      peakVal = v;
      peakHour = h;
    }
  });

  let score: number | null = null;
  let bucket: MovementBucket = "none";
  if (baseline.length >= MIN_BASELINE_DAYS) {
    const atHour = baseline.map((d) => valueAtHour(d, hourNow));
    const center = trimmedMedian(atHour);
    const spread = mad(atHour, center);
    // MAD can be 0 on very regular data — fall back to a gentle relative scale.
    const scale = spread > 0 ? spread : Math.max(center * 0.15, 1);
    score = Math.max(
      -SCORE_CLAMP,
      Math.min(SCORE_CLAMP, (today.total - center) / scale),
    );
    bucket = score <= -BUCKET_EDGE ? "quiet" : score >= BUCKET_EDGE ? "lively" : "usual";
  }

  return {
    date: todayKey,
    source: today.source,
    unit: today.unit,
    hours: today.hours,
    totalSoFar: today.total,
    score,
    bucket,
    baselineDays: baseline.length,
    peakHour,
  };
}

/** Last-N-days totals for the small strip. null = no data (rendered as ·, never 0). */
export function weekStrip(
  samples: ActivitySample[],
  now: number = Date.now(),
  days = 7,
): { date: string; total: number | null }[] {
  const byDate = groupByDate(samples);
  const out: { date: string; total: number | null }[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const key = dateKeyOffset(now, offset);
    const daySamples = byDate.get(key);
    const detail = daySamples ? canonicalDay(daySamples) : null;
    out.push({ date: key, total: detail ? detail.total : null });
  }
  return out;
}

// ── demo source (clearly-labeled sample data, until a real device connects) ──

/** Deterministic small PRNG so sample data is stable across renders. */
function seeded(seedStr: string): () => number {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
}

/** Plausible hourly steps: quiet nights, a morning rise, an afternoon burst. */
function demoHourSteps(hour: number, rnd: () => number): number {
  if (hour < 7) return Math.round(rnd() * 40);
  if (hour < 10) return Math.round(200 + rnd() * 700);
  if (hour < 17) {
    const burst = rnd() > 0.85 ? 900 : 0;
    return Math.round(150 + rnd() * 500 + burst);
  }
  if (hour < 20) return Math.round(300 + rnd() * 600);
  return Math.round(50 + rnd() * 250);
}

/**
 * Generate sample-data history (full past days + today up to the current
 * hour) so the live module can be previewed before any device exists.
 */
export function generateDemoSamples(
  now: number = Date.now(),
  days: number = BASELINE_WINDOW_DAYS,
): ActivitySample[] {
  const out: ActivitySample[] = [];
  const hourNow = new Date(now).getHours();
  for (let offset = days; offset >= 0; offset--) {
    const date = dateKeyOffset(now, offset);
    const rnd = seeded(date);
    const lastHour = offset === 0 ? hourNow : 23;
    for (let hour = 0; hour <= lastHour; hour++) {
      out.push({
        date,
        hour,
        source: "demo",
        steps: demoHourSteps(hour, rnd),
        fetchedAt: now,
      });
    }
  }
  return out;
}
