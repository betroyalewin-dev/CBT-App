import { Link } from "react-router-dom";
import { useStore } from "../store/store";
import { QuadrantPad } from "../components/QuadrantPad";
import { TrendStrip } from "../components/TrendStrip";
import { computeDashboard } from "../domain/dashboard";
import { computeStreak } from "../domain/streak";
import { QUADRANT_META } from "../domain/mood";
import { PROFILES } from "../domain/profiles";
import { GrowthMeter } from "../components/GrowthMeter";
import { MovementCard } from "../components/MovementCard";
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
        <MovementCard />
      </section>

      <section className="panel">
        <TrendStrip logs={state.logs} />
      </section>

      {profile && (
        <section className="panel today-profile">
          <p className="eyebrow">Your starting picture</p>
          <h3>{profile.title}</h3>
          <p className="muted">{profile.blurb}</p>
        </section>
      )}

      <Link className="btn btn--primary btn--block" to="/log">
        + Log a moment
      </Link>
    </div>
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
