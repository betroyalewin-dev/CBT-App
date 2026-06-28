import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/store";
import { generateInsights, type Insight } from "../domain/insights";
import "./InsightsScreen.css";

export function InsightsScreen() {
  const { state } = useStore();
  const insights = generateInsights(state.logs);

  return (
    <div className="stack insights">
      <header>
        <h1>Patterns worth testing</h1>
        <p className="muted">
          These are hunches from your own data — never verdicts. Early data is
          noisy and confounded, so we hand you a hypothesis, not a prescription.
        </p>
      </header>

      {state.logs.length < 3 ? (
        <div className="panel insights-empty">
          <h3>A little more data first</h3>
          <p className="muted">
            After a handful of logs, real patterns start to show. Keep going —
            even short check-ins count.
          </p>
          <Link className="btn btn--primary" to="/log">
            Log a moment
          </Link>
        </div>
      ) : insights.length === 0 ? (
        <div className="panel insights-empty">
          <h3>Nothing stands out yet</h3>
          <p className="muted">
            Your data so far is fairly even — no single thing is clearly moving
            the needle. That's honest information too.
          </p>
        </div>
      ) : (
        <div className="stack">
          {insights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="panel insight">
      <span className={`insight-tag insight-tag--${insight.kind}`}>
        {insight.kind === "lever"
          ? "possible lever"
          : insight.kind === "mastery-gap"
            ? "mastery gap"
            : "prediction gap"}
      </span>
      <p className="insight-text">{insight.text}</p>
      {open ? (
        <div className="insight-exp">
          <h3>Turn it into an experiment</h3>
          <p className="muted">{insight.experimentPrompt}</p>
          <Link className="btn btn--primary" to="/log">
            Start the experiment
          </Link>
          <p className="muted insight-foot">
            You'll predict first, then log how it actually went. The gap is the
            whole point.
          </p>
        </div>
      ) : (
        <button className="btn btn--ghost" onClick={() => setOpen(true)}>
          → turn into an experiment
        </button>
      )}
    </article>
  );
}
