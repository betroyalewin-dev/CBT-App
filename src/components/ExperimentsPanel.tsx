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
import { XP } from "../domain/xp";
import { LockedTeaser } from "./LockedTeaser";
import "./ExperimentsPanel.css";

const METRICS: ExperimentMetric[] = ["mood", "mastery", "pleasure"];

export function ExperimentsPanel({ seedLabel }: { seedLabel?: string }) {
  const { state } = useStore();
  const accl = acclimation(state.logs);

  return (
    <section className="stack experiments">
      <header className="experiments-head">
        <h2>Experiments</h2>
      </header>

      {!accl.ready ? (
        <ExperimentsLocked accl={accl} />
      ) : (
        <ReadyState seedLabel={seedLabel} />
      )}
    </section>
  );
}

function ExperimentsLocked({ accl }: { accl: ReturnType<typeof acclimation> }) {
  const need: string[] = [];
  if (accl.daysToGo > 0)
    need.push(`${accl.daysToGo} more ${accl.daysToGo === 1 ? "day" : "days"}`);
  if (accl.logsToGo > 0)
    need.push(`${accl.logsToGo} more ${accl.logsToGo === 1 ? "log" : "logs"}`);

  return <LockedTeaser title="Locked" need={`${need.join(" and ")} to go.`} />;
}

function ReadyState({ seedLabel }: { seedLabel?: string }) {
  const { state, dispatch } = useStore();
  const active = state.experiments.filter((e) => !e.claimedAt);
  const claimed = state.experiments.filter((e) => e.claimedAt);

  return (
    <div className="stack">
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
        {DEFAULT_EXPERIMENT_DAYS} days, comparing days with{" "}
        <strong>{label || "this"}</strong> vs. without.
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
