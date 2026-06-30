import { useState } from "react";
import { useStore, newId } from "../store/store";
import {
  acclimation,
  evaluateExperiment,
  readExperiment,
  metricLabel,
  DEFAULT_EXPERIMENT_DAYS,
  type Experiment,
  type ExperimentMetric,
} from "../domain/experiments";
import { assessJourney } from "../domain/journey";
import {
  recommendActivity,
  CATEGORY_META,
  isTrackableActivity,
} from "../domain/activities";
import { XP } from "../domain/xp";
import "./ExperimentsPanel.css";

const METRICS: ExperimentMetric[] = ["mood", "mastery", "pleasure"];

export function ExperimentsPanel({ seedLabel }: { seedLabel?: string }) {
  const { state } = useStore();
  const accl = acclimation(state.logs);

  return (
    <section className="stack experiments">
      <header className="experiments-head">
        <h2>Your experiments</h2>
        <p className="muted">
          Test one thing at a time — "does this actually move my mood?" — and let
          your own data answer over a couple of weeks.
        </p>
      </header>

      {!accl.ready ? (
        <LockedTeaser accl={accl} />
      ) : (
        <ReadyState seedLabel={seedLabel} />
      )}
    </section>
  );
}

function LockedTeaser({ accl }: { accl: ReturnType<typeof acclimation> }) {
  const need: string[] = [];
  if (accl.daysToGo > 0)
    need.push(`${accl.daysToGo} more ${accl.daysToGo === 1 ? "day" : "days"} of logging`);
  if (accl.logsToGo > 0)
    need.push(`${accl.logsToGo} more ${accl.logsToGo === 1 ? "entry" : "entries"}`);

  return (
    <div className="panel experiments-locked">
      <span className="experiments-lock" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <h3>Unlocks once you've settled in</h3>
        <p className="muted">
          Experiments open after you've gotten a feel for plain logging — about
          two days in. {need.length ? `Just ${need.join(" and ")} to go.` : ""}
        </p>
      </div>
    </div>
  );
}

function ReadyState({ seedLabel }: { seedLabel?: string }) {
  const { state, dispatch } = useStore();
  const active = state.experiments.filter((e) => !e.claimedAt);
  const claimed = state.experiments.filter((e) => e.claimedAt);

  return (
    <div className="stack">
      {!seedLabel && <Recommended active={active} />}

      {active.map((exp) => (
        <ExperimentCard key={exp.id} exp={exp} />
      ))}

      <Creator seedLabel={seedLabel} onCreate={(exp) => dispatch({ type: "addExperiment", experiment: exp })} />

      {claimed.length > 0 && (
        <p className="muted experiments-done-count">
          {claimed.length} finished {claimed.length === 1 ? "experiment" : "experiments"} so far.
        </p>
      )}
    </div>
  );
}

/**
 * The app's own suggestion for the next experiment — derived from where the
 * person is in their recovery (pleasure-first when low, mastery as they climb)
 * and what their recent logs are starved of. Framed as an invitation to test,
 * never an instruction.
 */
function Recommended({ active }: { active: Experiment[] }) {
  const { state, dispatch } = useStore();
  const journey = assessJourney({
    axis: state.axis,
    phq9: state.phq9History[state.phq9History.length - 1],
    logs: state.logs,
  });
  const rec = recommendActivity({
    journey,
    logs: state.logs,
    activities: state.activities,
  });
  const meta = CATEGORY_META[rec.category];

  // Don't suggest what's already being tested.
  if (active.some((e) => e.activityLabel === rec.activityLabel)) return null;

  function start() {
    if (isTrackableActivity(rec.activityLabel)) {
      dispatch({ type: "addActivity", label: rec.activityLabel });
    }
    dispatch({
      type: "addExperiment",
      experiment: {
        id: newId(),
        activityLabel: rec.activityLabel,
        metric: rec.metric,
        hypothesis: rec.hypothesis,
        startedAt: Date.now(),
        days: DEFAULT_EXPERIMENT_DAYS,
      },
    });
  }

  return (
    <article className="panel experiment experiment--rec">
      <span className="experiment-rec-tag">Suggested next · {meta.label}</span>
      <h3>{rec.activityLabel}</h3>
      <p className="experiment-rec-why">{rec.rationale}</p>
      <p className="muted experiment-rec-hyp">
        We'd compare days you do this against days you don't, for{" "}
        {DEFAULT_EXPERIMENT_DAYS} days — a hunch to test, not a prescription.
      </p>
      <button className="btn btn--primary" onClick={start}>
        Test this for {DEFAULT_EXPERIMENT_DAYS} days
      </button>
    </article>
  );
}

function ExperimentCard({ exp }: { exp: Experiment }) {
  const { state, dispatch } = useStore();
  const r = evaluateExperiment(exp, state.logs);
  const pct = Math.round((r.elapsedDays / r.totalDays) * 100);

  return (
    <article className="panel experiment">
      <div className="experiment-top">
        <h3>{exp.activityLabel}</h3>
        <span className="experiment-metric">vs. your {metricLabel(exp.metric)}</span>
      </div>

      <div
        className="experiment-progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <p className="muted experiment-elapsed">
        Day {Math.min(r.elapsedDays + 1, r.totalDays)} of {r.totalDays} ·{" "}
        {r.withN} with, {r.withoutN} without
      </p>

      <p className="experiment-read">{readExperiment(exp, r)}</p>

      {r.done && (
        <button
          className="btn btn--primary"
          onClick={() =>
            dispatch({
              type: "claimExperiment",
              id: exp.id,
              reason: "you saw an experiment through",
            })
          }
        >
          See the result · +{XP.experiment}
        </button>
      )}
    </article>
  );
}

function Creator({
  seedLabel,
  onCreate,
}: {
  seedLabel?: string;
  onCreate: (exp: Experiment) => void;
}) {
  const { state } = useStore();
  const options = state.activities;
  const [open, setOpen] = useState(Boolean(seedLabel));
  const [label, setLabel] = useState<string>(seedLabel ?? options[0] ?? "");
  const [metric, setMetric] = useState<ExperimentMetric>("mood");

  if (options.length === 0) {
    return (
      <p className="muted">
        Add an activity or two to your logs first, then you can test one here.
      </p>
    );
  }

  if (!open) {
    return (
      <button className="btn btn--ghost btn--block" onClick={() => setOpen(true)}>
        + Start a new experiment
      </button>
    );
  }

  function start() {
    if (!label) return;
    onCreate({
      id: newId(),
      activityLabel: label,
      metric,
      hypothesis: `Does "${label}" move my ${metricLabel(metric)}?`,
      startedAt: Date.now(),
      days: DEFAULT_EXPERIMENT_DAYS,
    });
    setOpen(false);
  }

  return (
    <div className="panel stack experiment-creator">
      <div className="stack-sm">
        <span className="eyebrow">Test which activity?</span>
        <div className="chiprow">
          {options.map((a) => (
            <button
              key={a}
              type="button"
              className={`pill ${label === a ? "is-selected" : ""}`}
              onClick={() => setLabel(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="stack-sm">
        <span className="eyebrow">Against what?</span>
        <div className="chiprow">
          {METRICS.map((m) => (
            <button
              key={m}
              type="button"
              className={`pill ${metric === m ? "is-selected" : ""}`}
              onClick={() => setMetric(m)}
            >
              {metricLabel(m)}
            </button>
          ))}
        </div>
      </div>

      <p className="muted experiment-hyp">
        Over the next {DEFAULT_EXPERIMENT_DAYS} days, we'll quietly compare days
        you log <strong>{label || "this"}</strong> against days you don't. No
        pressure to do it daily.
      </p>

      <div className="row experiment-actions">
        <button className="btn btn--ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button className="btn btn--primary" disabled={!label} onClick={start}>
          Start the test
        </button>
      </div>
    </div>
  );
}
