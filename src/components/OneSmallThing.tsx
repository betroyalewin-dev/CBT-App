import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore, newId } from "../store/store";
import { bestBets, effortWord, type ActivityStat } from "../domain/ledger";
import { recentPlanOutcome, planAge, type ActivityPlan } from "../domain/plan";
import { PMSlider } from "./PMSlider";
import "./OneSmallThing.css";

/**
 * The BA move, front and center: pick one activity that gives more than it
 * takes, forecast how it'll feel, do it, and read reality against the
 * forecast. Three states: a live plan, a fresh outcome, or the "best bets"
 * ranking that seeds the next plan.
 */
export function OneSmallThing() {
  const { state, dispatch } = useStore();
  if (state.logs.length === 0) return null;

  const plan = state.plan;
  const outcome = recentPlanOutcome(state.logs);
  const bets = bestBets(state.logs);

  return (
    <section className="panel ost" aria-label="One small thing">
      <header className="ost-head">
        <h2>One small thing</h2>
      </header>

      {plan ? (
        <PlanCard
          plan={plan}
          onCancel={() => dispatch({ type: "cancelPlan" })}
        />
      ) : (
        <>
          {outcome && <OutcomeNote outcome={outcome} />}
          {bets.length > 0 ? (
            <div className="ost-bets">
              <p className="muted ost-bets-lead">
                {outcome
                  ? "Want to line up the next one?"
                  : "What's been giving you the most back:"}
              </p>
              {bets.map((bet) => (
                <BetRow
                  key={bet.label}
                  bet={bet}
                  onPlan={(predictedPleasure) =>
                    dispatch({
                      type: "setPlan",
                      plan: {
                        id: newId(),
                        activityLabel: bet.label,
                        predictedPleasure,
                        at: Date.now(),
                      },
                    })
                  }
                />
              ))}
            </div>
          ) : (
            !outcome && (
              <p className="muted ost-teach">
                Log a few different activities, not just moods, and your best
                bets will show up here.
              </p>
            )
          )}
        </>
      )}
    </section>
  );
}

function PlanCard({
  plan,
  onCancel,
}: {
  plan: ActivityPlan;
  onCancel: () => void;
}) {
  return (
    <div className="ost-plan">
      <p className="ost-plan-what">{plan.activityLabel}</p>
      <p className="muted ost-plan-meta">
        Planned {planAge(plan)} · predicted {plan.predictedPleasure}/10
      </p>
      <div className="ost-actions">
        <Link className="btn btn--primary" to="/log">
          Log it now
        </Link>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Let it go
        </button>
      </div>
    </div>
  );
}

function OutcomeNote({
  outcome,
}: {
  outcome: { log: { activityLabel: string }; predicted: number; actual: number; delta: number };
}) {
  const read =
    outcome.delta >= 1
      ? "Better than your forecast. Depression tends to under-predict."
      : outcome.delta <= -1
        ? "Less than hoped. Honest data, not a failure."
        : "About what you expected. A forecast you can trust counts too.";
  return (
    <div
      className={`ost-outcome ${outcome.delta >= 1 ? "ost-outcome--beat" : ""}`}
    >
      <p className="ost-outcome-line">
        You did it: {outcome.log.activityLabel}. Predicted{" "}
        <span className="mono">{outcome.predicted}/10</span>, landed at{" "}
        <span className="mono">{outcome.actual}/10</span>.
      </p>
      <p className="muted ost-outcome-read">{read}</p>
    </div>
  );
}

function BetRow({
  bet,
  onPlan,
}: {
  bet: ActivityStat;
  onPlan: (predictedPleasure: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [predicted, setPredicted] = useState(5);

  const lift = bet.moodLift >= 0 ? `+${bet.moodLift.toFixed(1)}` : bet.moodLift.toFixed(1);
  const parts = [
    `${lift} mood vs your usual`,
    ...(bet.avgEffort !== null ? [`usually ${effortWord(bet.avgEffort)}`] : []),
    `${bet.n} logs`,
  ];

  return (
    <div className="ost-bet">
      <div className="ost-bet-row">
        <div className="ost-bet-body">
          <p className="ost-bet-label">{bet.label}</p>
          <p className="muted ost-bet-meta">{parts.join(" · ")}</p>
        </div>
        {!open && (
          <button
            type="button"
            className="btn btn--ghost ost-bet-btn"
            onClick={() => setOpen(true)}
          >
            Plan it
          </button>
        )}
      </div>
      {open && (
        <div className="ost-predict">
          <PMSlider
            label="Predicted enjoyment"
            hint="your honest forecast"
            value={predicted}
            onChange={setPredicted}
            accent
          />
          <div className="ost-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onPlan(predicted)}
            >
              Plan it for today
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setOpen(false)}
            >
              Never mind
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
