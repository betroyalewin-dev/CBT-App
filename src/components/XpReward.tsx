import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/store";
import { levelFromXp } from "../domain/xp";
import "./XpReward.css";

/**
 * The "small reward" moment: a calm points-earned toast that rises, settles, and
 * fades. Never confetti-loud — a quiet acknowledgement that you showed up.
 * Driven by the transient `lastAward`; clears itself after it plays.
 */
export function XpReward() {
  const { state, dispatch } = useStore();
  const award = state.lastAward;
  const [shown, setShown] = useState(award ?? null);
  const seen = useRef<string | null>(null);

  // Adopt each new award once, then schedule its dismissal.
  useEffect(() => {
    if (!award || award.id === seen.current) return;
    seen.current = award.id;
    setShown(award);
    const hold = award.levelUp ? 3400 : 2400;
    const t = window.setTimeout(() => {
      setShown(null);
      dispatch({ type: "clearAward" });
    }, hold);
    return () => window.clearTimeout(t);
  }, [award, dispatch]);

  if (!shown) return null;
  const level = levelFromXp(state.xp);

  return (
    <div className="xpreward" role="status" aria-live="polite">
      <div className="xpreward-card" key={shown.id}>
        <div className="xpreward-burst" aria-hidden>
          <span className="xpreward-amount">+{shown.total}</span>
        </div>
        <div className="xpreward-lines">
          {shown.levelUp ? (
            <p className="xpreward-levelup">
              New stage — <strong>{level.label}</strong>
            </p>
          ) : null}
          {shown.items.map((it, i) => (
            <p key={i} className="xpreward-reason">
              <span className="xpreward-pts">+{it.amount}</span> {it.reason}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
