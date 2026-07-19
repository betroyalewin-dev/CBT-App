import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { Likert } from "../components/Likert";
import { PHQ9_ITEMS, PHQ9_OPTIONS, scorePHQ9 } from "../domain/phq9";
import "./Onboarding.css";

/**
 * The biweekly PHQ-9 re-check — same instrument and one-question-per-page
 * pacing as onboarding, but standalone: it's how the app gets a repeated
 * outcome measure instead of a single day-zero snapshot.
 */
export function RecheckScreen() {
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<number[]>(Array(9).fill(-1));
  const [index, setIndex] = useState(0);

  const result = useMemo(
    () => (answers.every((v) => v >= 0) ? scorePHQ9(answers) : null),
    [answers],
  );

  function answer(v: number) {
    const next = answers.map((x, j) => (j === index ? v : x));
    setAnswers(next);
    if (index < PHQ9_ITEMS.length - 1) {
      setIndex(index + 1);
      return;
    }
    const scored = scorePHQ9(next);
    dispatch({ type: "recordPHQ9", result: scored });
    navigate(scored.safetyFlag ? "/safety" : "/today");
  }

  const progress = ((index + (result ? 1 : 0)) / PHQ9_ITEMS.length) * 100;

  return (
    <div className="app-frame">
      <main className="app-main onboard">
        <div className="onboard-topbar">
          <div
            className="onboard-progress"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        </div>

        <div className="onboard-stage" key={index}>
          <section className="stack onboard-qpage">
            <header className="onboard-qhead">
              <span className="eyebrow onboard-qsection">
                Check-in · {index + 1} of {PHQ9_ITEMS.length}
              </span>
              <p className="muted onboard-qcontext">
                Over the last 2 weeks, how often have you been bothered by…
              </p>
            </header>
            <div className="likert-solo">
              <Likert
                prompt={PHQ9_ITEMS[index]}
                options={PHQ9_OPTIONS}
                value={answers[index] >= 0 ? answers[index] : null}
                sensitive={index === 8}
                onChange={answer}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
