import type { ActivityLog } from "../domain/types";
import { DAY_MS } from "../domain/dashboard";
import { dayIndex } from "../domain/streak";
import { toPercent } from "../domain/mood";
import "./TrendStrip.css";

interface Props {
  logs: ActivityLog[];
  now?: number;
  days?: number;
}

function dailyValence(logs: ActivityLog[], now: number, days: number) {
  const today = dayIndex(now);
  const buckets: number[][] = Array.from({ length: days }, () => []);
  for (const l of logs) {
    const offset = today - dayIndex(l.timestamp);
    if (offset >= 0 && offset < days) {
      buckets[days - 1 - offset].push(toPercent(l.mood.valence));
    }
  }
  return buckets.map((b) =>
    b.length ? b.reduce((a, c) => a + c, 0) / b.length : null,
  );
}

export function TrendStrip({ logs, now = Date.now(), days = 14 }: Props) {
  const series = dailyValence(logs, now, days);
  const present = series.filter((v): v is number => v !== null);

  const thisWeek = logs.filter((l) => l.timestamp >= now - 7 * DAY_MS);
  const lastWeek = logs.filter(
    (l) => l.timestamp >= now - 14 * DAY_MS && l.timestamp < now - 7 * DAY_MS,
  );
  const avg = (xs: ActivityLog[]) =>
    xs.length ? xs.reduce((a, l) => a + l.mood.valence, 0) / xs.length : null;
  const tw = avg(thisWeek);
  const lw = avg(lastWeek);
  const delta = tw !== null && lw !== null ? tw - lw : null;

  return (
    <div className="trend">
      <div className="trend-head">
        <h3>Your trend</h3>
        {delta !== null ? (
          <span
            className={`trend-delta ${delta >= 0 ? "is-up" : "is-down"}`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} vs last week
          </span>
        ) : (
          <span className="muted trend-delta">building history…</span>
        )}
      </div>

      {present.length === 0 ? (
        <p className="muted trend-empty">
          Your mood line appears as you log — even a tap a day is enough.
        </p>
      ) : (
        <div className="trend-bars" aria-hidden>
          {series.map((v, i) => (
            <span
              key={i}
              className={`trend-bar ${v === null ? "is-empty" : ""}`}
              style={
                v === null
                  ? undefined
                  : { height: `${Math.max(6, v)}%`, animationDelay: `${i * 22}ms` }
              }
            />
          ))}
        </div>
      )}
      <p className="muted trend-caption">
        Mood, last {days} days · higher is more pleasant
      </p>
    </div>
  );
}
