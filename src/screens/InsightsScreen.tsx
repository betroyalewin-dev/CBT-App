import { useMemo, useRef, useState } from "react";
import { useStore } from "../store/store";
import { generateInsights, type Insight } from "../domain/insights";
import { assessLoops, LOOP_META, type LoopKey } from "../domain/loops";
import { DAY_MS } from "../domain/dashboard";
import { ExperimentsPanel } from "../components/ExperimentsPanel";
import { LockedTeaser } from "../components/LockedTeaser";
import "./InsightsScreen.css";

/** Don't re-ask about the same loop for a few days after a response. */
const LOOP_COOLDOWN_MS = 3 * DAY_MS;
/** Matches the minimum logs generateInsights/assessLoops need to produce anything. */
const INSIGHTS_MIN_LOGS = 3;

export function InsightsScreen() {
  const { state, dispatch } = useStore();
  const insights = generateInsights(state.logs);
  const loopAssessment = assessLoops(state.logs);
  const [seed, setSeed] = useState<string | undefined>(undefined);
  const expRef = useRef<HTMLDivElement>(null);

  function startExperiment(label?: string) {
    setSeed(label);
    expRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const primary = loopAssessment.primary;
  // Decide visibility once per loop key, not on every store update — otherwise
  // confirming/rejecting (which writes loopFeedback) would yank the card away
  // before its own "thanks" message ever shows.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showLoopCard = useMemo(() => {
    if (primary === undefined) return false;
    const feedback = state.loopFeedback[primary];
    return feedback === undefined || Date.now() - feedback.at > LOOP_COOLDOWN_MS;
  }, [primary]);

  function respondToLoop(key: LoopKey, response: "confirmed" | "rejected") {
    dispatch({ type: "respondToLoop", key, response });
  }

  const logsToGo = Math.max(0, INSIGHTS_MIN_LOGS - state.logs.length);

  return (
    <div className="stack insights">
      <header>
        <h1>Patterns worth testing</h1>
      </header>

      <section className="stack">
        <h2>Insights</h2>
        {logsToGo > 0 ? (
          <LockedTeaser
            title="Locked"
            need={`${logsToGo} more ${logsToGo === 1 ? "log" : "logs"} to go.`}
          />
        ) : (
          <>
            {showLoopCard && primary && (
              <LoopCard loopKey={primary} onRespond={respondToLoop} />
            )}
            {insights.length === 0 ? (
              <div className="panel insights-empty">
                <p className="muted">Nothing stands out yet.</p>
              </div>
            ) : (
              insights.map((ins) => (
                <InsightCard key={ins.id} insight={ins} onStart={startExperiment} />
              ))
            )}
          </>
        )}
      </section>

      <div ref={expRef}>
        <ExperimentsPanel key={seed ?? "none"} seedLabel={seed} />
      </div>
    </div>
  );
}

function LoopCard({
  loopKey,
  onRespond,
}: {
  loopKey: LoopKey;
  onRespond: (key: LoopKey, response: "confirmed" | "rejected") => void;
}) {
  const [answered, setAnswered] = useState<"confirmed" | "rejected" | null>(null);
  const meta = LOOP_META[loopKey];

  function respond(response: "confirmed" | "rejected") {
    setAnswered(response);
    onRespond(loopKey, response);
  }

  return (
    <article className="panel insight loop-card">
      <span className="insight-tag insight-tag--loop">pattern hypothesis</span>
      {answered === null ? (
        <>
          <p className="insight-text">{meta.question}</p>
          <p className="muted">{meta.blurb}</p>
          <div className="loop-card-actions">
            <button className="btn btn--primary" onClick={() => respond("confirmed")}>
              Yes, that's it
            </button>
            <button className="btn btn--ghost" onClick={() => respond("rejected")}>
              Not really
            </button>
          </div>
        </>
      ) : answered === "confirmed" ? (
        <p className="muted">
          Thanks — that helps. We'll lean on tools for {meta.title} first.
        </p>
      ) : (
        <p className="muted">
          Noted — we'll keep watching and adjust the hypothesis as more data comes in.
        </p>
      )}
    </article>
  );
}

function InsightCard({
  insight,
  onStart,
}: {
  insight: Insight;
  onStart: (label?: string) => void;
}) {
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
          <button
            className="btn btn--primary"
            onClick={() => onStart(insight.activityLabel)}
          >
            Set up this experiment
          </button>
        </div>
      ) : (
        <button className="btn btn--ghost" onClick={() => setOpen(true)}>
          → turn into an experiment
        </button>
      )}
    </article>
  );
}
