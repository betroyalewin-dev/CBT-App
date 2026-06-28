import { levelFromXp } from "../domain/xp";
import "./GrowthMeter.css";

const R = 26;
const C = 2 * Math.PI * R;

/**
 * Growth, not a scoreboard. Shows the current stage, a progress ring toward the
 * next one, and total points — framed warmly. It can only ever move forward.
 */
export function GrowthMeter({ xp }: { xp: number }) {
  const info = levelFromXp(xp);
  const dash = C * info.progress;

  return (
    <section className="growth panel" aria-label="Your growth">
      <div className="growth-ring" aria-hidden>
        <svg viewBox="0 0 64 64" width="64" height="64">
          <circle className="growth-ring-track" cx="32" cy="32" r={R} />
          <circle
            className="growth-ring-fill"
            cx="32"
            cy="32"
            r={R}
            style={{ strokeDasharray: `${dash} ${C}` }}
          />
        </svg>
        <span className="growth-ring-num">{info.level}</span>
      </div>
      <div className="growth-body">
        <p className="growth-label">{info.label}</p>
        <p className="growth-meta muted">
          {xp} pts
          {info.toNext > 0 ? ` · ${info.toNext} to next stage` : ""}
        </p>
      </div>
    </section>
  );
}
