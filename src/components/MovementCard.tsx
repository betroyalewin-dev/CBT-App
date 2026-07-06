import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store/store";
import {
  computeMovementDay,
  generateDemoSamples,
  localDateKey,
  weekStrip,
  MIN_BASELINE_DAYS,
  type MovementBucket,
} from "../domain/activity";
import "./MovementCard.css";

// The movement module (see ACTIVITY_SCORE.md): a standalone dashboard card,
// decoupled from the BA model. Its hero is today accruing live; the
// personal-baseline bucket is the quiet second line. It rewards the check,
// not the movement — a quiet day still shows fresh, neutral facts.

const BUCKET_LABEL: Record<Exclude<MovementBucket, "none">, string> = {
  quiet: "a quieter day",
  usual: "about your usual",
  lively: "a livelier day",
};

function hourLabel(h: number): string {
  if (h === 0) return "midnight";
  if (h === 12) return "noon";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function MovementCard() {
  const { state, dispatch } = useStore();
  const [now, setNow] = useState(() => Date.now());

  // The live tick — the whole point of the module is that it moves on its own.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  const demoConnected = state.activitySources.some((s) => s.id === "demo");

  // Sample data keeps flowing while connected, like a real device would.
  useEffect(() => {
    if (!demoConnected) return;
    const today = localDateKey(now);
    const hourNow = new Date(now).getHours();
    const have = new Set(
      state.activitySamples
        .filter((s) => s.source === "demo" && s.date === today)
        .map((s) => s.hour),
    );
    for (const s of generateDemoSamples(now, 0)) {
      if (s.hour <= hourNow && !have.has(s.hour)) {
        dispatch({ type: "recordMovement", sample: s });
      }
    }
  }, [demoConnected, now, state.activitySamples, dispatch]);

  const connected = state.activitySources.length > 0;
  const day = useMemo(
    () => computeMovementDay(state.activitySamples, now),
    [state.activitySamples, now],
  );
  const strip = useMemo(
    () => weekStrip(state.activitySamples, now, 7),
    [state.activitySamples, now],
  );

  if (!connected) return <ConnectInvite />;

  const hourNow = new Date(now).getHours();
  const manualMode = day.unit === "manualLevel" || (day.unit === null && demoOff(state));
  const stripMax = Math.max(...strip.map((d) => d.total ?? 0), 1);

  return (
    <div className="movement">
      <div className="movement-head">
        <h3>
          Movement
          {day.totalSoFar > 0 && <span className="movement-live" aria-hidden />}
        </h3>
        {day.bucket !== "none" ? (
          <span className={`movement-pill movement-pill--${day.bucket}`}>
            {BUCKET_LABEL[day.bucket]}
          </span>
        ) : (
          <span className="muted movement-pill movement-pill--building">
            learning your usual · {Math.min(day.baselineDays, MIN_BASELINE_DAYS)}/
            {MIN_BASELINE_DAYS} days
          </span>
        )}
      </div>

      {manualMode ? (
        <ManualToday now={now} />
      ) : (
        <>
          <div className="movement-hours" aria-hidden>
            {day.hours.map((v, h) => {
              const max = Math.max(...day.hours.map((x) => x ?? 0), 1);
              if (h > hourNow) return <span key={h} className="mv-bar is-future" />;
              if (v === null || v === 0)
                return <span key={h} className="mv-bar is-still" />;
              return (
                <span
                  key={h}
                  className={`mv-bar ${h === hourNow ? "is-now" : ""}`}
                  style={{ height: `${Math.max(10, (v / max) * 100)}%` }}
                />
              );
            })}
          </div>
          <p className="muted movement-caption">
            {day.totalSoFar === 0
              ? "A still day so far — the bars fill in as your day happens."
              : day.peakHour !== null
                ? `Today so far · a burst around ${hourLabel(day.peakHour)}`
                : "Today so far"}
          </p>
        </>
      )}

      <div className="movement-week">
        <span className="muted movement-week-label">last 7 days</span>
        <div className="movement-week-bars" aria-hidden>
          {strip.map((d) =>
            d.total === null ? (
              <span key={d.date} className="mv-dot" title="no data" />
            ) : (
              <span
                key={d.date}
                className="mv-week-bar"
                style={{ height: `${Math.max(12, (d.total / stripMax) * 100)}%` }}
              />
            ),
          )}
        </div>
      </div>

      <MovementFooter demo={demoConnected} />
    </div>
  );
}

function demoOff(state: { activitySources: { id: string }[] }): boolean {
  return !state.activitySources.some((s) => s.id === "demo");
}

/** Manual mode: one gentle judgment per day, compared only to your own days. */
function ManualToday({ now }: { now: number }) {
  const { state, dispatch } = useStore();
  const today = localDateKey(now);
  const sample = state.activitySamples.find(
    (s) => s.source === "manual" && s.date === today,
  );
  const level = sample?.manualLevel ?? null;

  return (
    <div className="movement-manual">
      <label className="muted" htmlFor="movement-level">
        How much have you moved so far today?
      </label>
      <input
        id="movement-level"
        type="range"
        min={0}
        max={10}
        step={1}
        value={level ?? 0}
        onChange={(e) =>
          dispatch({
            type: "recordMovement",
            sample: {
              date: today,
              hour: new Date(now).getHours(),
              source: "manual",
              manualLevel: Number(e.target.value),
              fetchedAt: now,
            },
          })
        }
      />
      <div className="movement-manual-scale muted" aria-hidden>
        <span>barely</span>
        <span>some</span>
        <span>a lot</span>
      </div>
      {level === null && (
        <p className="muted movement-caption">
          Not logged yet today — any amount counts, including barely.
        </p>
      )}
    </div>
  );
}

function ConnectInvite() {
  const { dispatch } = useStore();
  return (
    <div className="movement movement--invite">
      <div className="movement-head">
        <h3>Movement</h3>
      </div>
      <p className="muted">
        A live picture of your day that gathers itself — something new to see
        every time you open the app, even when logging feels like too much.
      </p>
      <div className="movement-actions">
        <button
          className="btn btn--primary"
          onClick={() =>
            dispatch({
              type: "connectActivitySource",
              source: "demo",
              samples: generateDemoSamples(),
            })
          }
        >
          Preview with sample data
        </button>
        <button
          className="btn"
          onClick={() => dispatch({ type: "connectActivitySource", source: "manual" })}
        >
          Track by hand
        </button>
      </div>
      <p className="muted movement-fineprint">
        Device sync (watch / phone steps) is coming. Whatever you choose, the
        data stays on this device and disconnecting removes it.
      </p>
    </div>
  );
}

function MovementFooter({ demo }: { demo: boolean }) {
  const { state, dispatch } = useStore();
  const [managing, setManaging] = useState(false);
  return (
    <div className="movement-foot">
      <span className="muted movement-fineprint">
        {demo ? "Sample data · " : ""}stays on this device
      </span>
      {managing ? (
        <span className="movement-manage-row">
          {state.activitySources.map((s) => (
            <button
              key={s.id}
              className="movement-manage-btn"
              onClick={() => {
                dispatch({ type: "disconnectActivitySource", source: s.id });
                setManaging(false);
              }}
            >
              remove {s.id === "demo" ? "sample data" : s.id}
            </button>
          ))}
          <button className="movement-manage-btn" onClick={() => setManaging(false)}>
            done
          </button>
        </span>
      ) : (
        <button className="movement-manage-btn" onClick={() => setManaging(true)}>
          manage
        </button>
      )}
    </div>
  );
}
