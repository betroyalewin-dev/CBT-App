import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { isRecheckDue } from "../domain/recheck";
import "./RecheckReminder.css";

/**
 * Surfaces the biweekly PHQ-9 re-check when it's due. "Remind me later"
 * dismisses for this session only (in-memory, not persisted) — it reopens
 * next time the app loads, which is the whole point of a recurring outcome
 * measure: it can be deferred, never silently skipped.
 */
export function RecheckReminder() {
  const { state } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const due = isRecheckDue(state.phq9History);
  const onRecheckScreen = location.pathname === "/recheck";
  if (!due || dismissed || onRecheckScreen) return null;

  return (
    <div className="recheck-backdrop" role="presentation">
      <div
        className="recheck-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recheck-title"
      >
        <h2 id="recheck-title">Time for a check-in</h2>
        <p className="muted">
          It's been about two weeks since your last check-in. A quick re-check
          helps you and the app see whether things are moving.
        </p>
        <div className="recheck-actions">
          <button
            className="btn btn--primary btn--block"
            onClick={() => navigate("/recheck")}
          >
            Take the check-in
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => setDismissed(true)}
          >
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
