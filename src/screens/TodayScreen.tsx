import { Link } from "react-router-dom";
import { useStore } from "../store/store";
import { QuadrantPad } from "../components/QuadrantPad";
import { TrendStrip } from "../components/TrendStrip";
import { computeDashboard } from "../domain/dashboard";
import { computeStreak } from "../domain/streak";
import { QUADRANT_META } from "../domain/mood";
import { assessJourney, type JourneySignal } from "../domain/journey";
import { GrowthMeter } from "../components/GrowthMeter";
import "./TodayScreen.css";

function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function TodayScreen() {
  const { state } = useStore();
  const dash = computeDashboard(state.logs);
  const streak = computeStreak(state.logs);
  const journey = assessJourney({
    axis: state.axis,
    phq9: state.phq9History[state.phq9History.length - 1],
    logs: state.logs,
  });

  return (
    <div className="stack today">
      <header className="today-head">
        <p className="eyebrow">{greeting()}</p>
        <h1>Where you are</h1>
      </header>

      <StreakBadge streak={streak} />

      {state.logs.length > 0 && <GrowthMeter xp={state.xp} />}

      <section className="panel stack today-board">
        <QuadrantPad
          axis={dash.axis}
          quadrant={dash.quadrant}
          hasData={dash.hasData}
        />
        {dash.hasData ? (
          <div className={`today-advice today-advice--${dash.quadrant}`}>
            <h2>{QUADRANT_META[dash.quadrant].title}</h2>
            <p>{QUADRANT_META[dash.quadrant].advice}</p>
            <p className="muted today-sample">
              Based on a 3-day smoothed read of your last {dash.sampleSize}{" "}
              {dash.sampleSize === 1 ? "entry" : "entries"}.
            </p>
          </div>
        ) : (
          <div className="today-advice">
            <h2>Let's get your first read</h2>
            <p>
              Your dot appears once you've logged. It's just your own mood taps,
              smoothed — nothing mysterious.
            </p>
            <Link className="btn btn--primary" to="/log">
              Log how you feel
            </Link>
          </div>
        )}
      </section>

      <section className="panel">
        <TrendStrip logs={state.logs} />
      </section>

      <JourneyPanel journey={journey} living={journey.logWeight > 0} />

      <Link className="btn btn--primary btn--block" to="/log">
        + Log a moment
      </Link>
    </div>
  );
}

function JourneyPanel({
  journey,
  living,
}: {
  journey: JourneySignal;
  living: boolean;
}) {
  // pleasureBias 0…1 → marker position from the left (Enjoyment end).
  const markerPct = Math.round((1 - journey.pleasureBias) * 100);
  return (
    <section className="panel today-journey">
      <h3>{journey.title}</h3>
      <p>{journey.focus}</p>

      <div className="focus-meter">
        <div
          className="focus-track"
          role="img"
          aria-label={`Where to put your energy right now: ${
            journey.pleasureBias >= 0.5
              ? "leaning toward enjoyment"
              : "leaning toward accomplishment"
          }`}
        >
          <span className="focus-marker" style={{ left: `${markerPct}%` }} />
        </div>
        <div className="focus-ends">
          <span>Enjoyment</span>
          <span>Accomplishment</span>
        </div>
      </div>

      <p className="muted today-journey-why">{journey.rationale}</p>
      <p className="muted today-journey-source">
        {living
          ? "This reads from your recent logs — it moves as you do."
          : "Based on your check-in for now; it'll move as you log."}
      </p>
    </section>
  );
}

function StreakBadge({
  streak,
}: {
  streak: ReturnType<typeof computeStreak>;
}) {
  if (streak.status === "new") {
    return (
      <div className="streak streak--new">
        <strong>Welcome.</strong> Your first log starts everything.
      </div>
    );
  }
  if (streak.status === "welcome-back") {
    return (
      <div className="streak streak--back">
        <strong>Welcome back.</strong> No streak lost — picking up exactly where
        you are.
      </div>
    );
  }
  return (
    <div className="streak streak--active">
      <strong>{streak.days}-day rhythm</strong>
      <span className="muted">
        {streak.graceUsed
          ? " · a missed day is fine, you're still going"
          : " · gently, consistently"}
      </span>
    </div>
  );
}
