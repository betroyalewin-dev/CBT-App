import { Link } from "react-router-dom";
import { useStore } from "../store/store";
import { QuadrantPad } from "../components/QuadrantPad";
import { TrendStrip } from "../components/TrendStrip";
import { computeDashboard } from "../domain/dashboard";
import { computeStreak } from "../domain/streak";
import { QUADRANT_META } from "../domain/mood";
import { PROFILES } from "../domain/profiles";
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
  const profile = state.profile ? PROFILES[state.profile] : null;
  const meta = QUADRANT_META[dash.quadrant];

  return (
    <div className="stack today">
      <header className="today-head">
        <p className="eyebrow">{greeting()}</p>
        <h1>Where you are</h1>
      </header>

      <section className="panel today-board">
        <div className="board-read">
          <QuadrantPad
            compact
            axis={dash.axis}
            quadrant={dash.quadrant}
            hasData={dash.hasData}
          />
          {dash.hasData ? (
            <div className={`board-reading board-reading--${dash.quadrant}`}>
              <h2>{meta.title}</h2>
              <div className="axis-meters">
                <AxisMeter label="Things landing" value={dash.axis.reward} />
                <AxisMeter label="Load" value={dash.axis.stress} />
              </div>
              <p className="muted board-sample">
                3-day smoothed · {dash.sampleSize}{" "}
                {dash.sampleSize === 1 ? "entry" : "entries"}
              </p>
            </div>
          ) : (
            <div className="board-reading">
              <h2>Let's get your first read</h2>
              <p className="muted board-empty-note">
                Your dot appears once you've logged. It's just your own mood
                taps, smoothed — nothing mysterious.
              </p>
            </div>
          )}
        </div>

        {dash.hasData && <p className="board-advice">{meta.advice}</p>}

        <div className="board-trend">
          <TrendStrip logs={state.logs} />
        </div>
      </section>

      <section className="today-vitals" aria-label="Your rhythm and growth">
        <StreakNote streak={streak} />
        {state.logs.length > 0 && <GrowthMeter xp={state.xp} />}
      </section>

      {profile && (
        <aside className="today-profile">
          <p className="eyebrow">Your starting picture</p>
          <h3>{profile.title}</h3>
          <p className="muted">{profile.blurb}</p>
        </aside>
      )}

      <Link className="btn btn--primary btn--block" to="/log">
        + Log a moment
      </Link>
    </div>
  );
}

function AxisMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="axis-meter">
      <div className="axis-meter-head">
        <span>{label}</span>
        <span className="mono axis-meter-num">{value}</span>
      </div>
      <div className="axis-meter-track" aria-hidden>
        <span className="axis-meter-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StreakNote({
  streak,
}: {
  streak: ReturnType<typeof computeStreak>;
}) {
  if (streak.status === "new") {
    return (
      <div className="vital">
        <p className="vital-lead">Welcome</p>
        <p className="muted vital-note">Your first log starts everything.</p>
      </div>
    );
  }
  if (streak.status === "welcome-back") {
    return (
      <div className="vital">
        <p className="vital-lead">Welcome back</p>
        <p className="muted vital-note">
          No streak lost — picking up exactly where you are.
        </p>
      </div>
    );
  }
  return (
    <div className="vital">
      <p className="vital-lead">{streak.days}-day rhythm</p>
      <p className="muted vital-note">
        {streak.graceUsed
          ? "A missed day is fine — you're still going."
          : "Gently, consistently."}
      </p>
    </div>
  );
}
