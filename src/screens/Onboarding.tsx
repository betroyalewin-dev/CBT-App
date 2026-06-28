import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, newId } from "../store/store";
import { Likert } from "../components/Likert";
import { MoodGrid } from "../components/MoodGrid";
import { PMSlider } from "../components/PMSlider";
import { SafetyScreen } from "./SafetyScreen";
import { PHQ9_ITEMS, PHQ9_OPTIONS, scorePHQ9 } from "../domain/phq9";
import { AXIS_ITEMS, AXIS_OPTIONS, scoreAxisPlacement } from "../domain/axis";
import { assignProfile, PROFILES } from "../domain/profiles";
import type { MoodPoint, PHQ9Result } from "../domain/types";
import "./Onboarding.css";

type Step =
  | "welcome"
  | "phq9"
  | "safety"
  | "axis"
  | "profile"
  | "values"
  | "activities"
  | "firstlog";

const VALUES: { tag: string; activities: string[] }[] = [
  { tag: "Relationships", activities: ["Message a friend", "Time with family"] },
  { tag: "Health", activities: ["A short walk", "Cook something"] },
  { tag: "Creativity", activities: ["Make something", "Play music"] },
  { tag: "Work / purpose", activities: ["One focused task", "Tidy a space"] },
  { tag: "Learning", activities: ["Read a few pages", "Learn something small"] },
  { tag: "Nature", activities: ["Step outside", "Sit in daylight"] },
  { tag: "Calm", activities: ["Breathe / stretch", "Warm shower"] },
  { tag: "Play", activities: ["Something fun", "A favorite show"] },
];

type Dir = "fwd" | "back";

export function Onboarding() {
  const { dispatch } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("welcome");
  const [history, setHistory] = useState<Step[]>([]);
  const [dir, setDir] = useState<Dir>("fwd");

  function go(next: Step) {
    setHistory((h) => [...h, step]);
    setDir("fwd");
    setStep(next);
  }
  function back() {
    setHistory((h) => {
      if (!h.length) return h;
      setDir("back");
      setStep(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }

  const [phq9, setPhq9] = useState<number[]>(Array(9).fill(-1));
  const [axis, setAxis] = useState<number[]>(Array(6).fill(-1));
  const [values, setValues] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [firstMood, setFirstMood] = useState<MoodPoint | null>(null);
  const [firstP, setFirstP] = useState(5);
  const [firstM, setFirstM] = useState(5);

  const phq9Result: PHQ9Result | null = useMemo(
    () => (phq9.every((v) => v >= 0) ? scorePHQ9(phq9) : null),
    [phq9],
  );
  const axisScores = useMemo(
    () => (axis.every((v) => v >= 0) ? scoreAxisPlacement(axis) : null),
    [axis],
  );
  const profileKey = axisScores ? assignProfile(axisScores) : null;

  const suggestedActivities = useMemo(() => {
    const set = new Set<string>();
    VALUES.filter((v) => values.includes(v.tag)).forEach((v) =>
      v.activities.forEach((a) => set.add(a)),
    );
    return [...set];
  }, [values]);

  function finish() {
    if (!phq9Result || !axisScores || !profileKey || !firstMood) return;
    dispatch({
      type: "completeOnboarding",
      payload: {
        phq9: phq9Result,
        axis: axisScores,
        profile: profileKey,
        values,
        activities: activities.length ? activities : suggestedActivities,
        anxiousFlag: axisScores.stress >= 66,
      },
    });
    dispatch({
      type: "addLog",
      log: {
        id: newId(),
        timestamp: Date.now(),
        activityLabel: "First check-in",
        mood: firstMood,
        pleasure: firstP,
        mastery: firstM,
        planned: false,
      },
    });
    navigate("/today");
  }

  const stepsOrder: Step[] = [
    "welcome",
    "phq9",
    "axis",
    "profile",
    "values",
    "activities",
    "firstlog",
  ];
  const progressIndex = Math.max(0, stepsOrder.indexOf(step));
  const progress =
    step === "safety" ? null : (progressIndex / (stepsOrder.length - 1)) * 100;

  return (
    <div className="app-frame">
      <main className="app-main onboard">
        <div className="onboard-topbar">
          <button
            type="button"
            className={`onboard-back ${history.length ? "" : "is-hidden"}`}
            onClick={back}
            aria-label="Go back"
            tabIndex={history.length ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                d="M15 6l-6 6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {progress !== null && (
            <div
              className="onboard-progress"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          )}
        </div>

        <div className="onboard-stage" key={step} data-dir={dir} data-step={step}>
        {step === "welcome" && (
          <section className="stack onboard-welcome">
            <span className="onboard-mark" aria-hidden />
            <h1>A companion, not a doctor.</h1>
            <p>
              This is a calm place to notice how you feel and what helps —
              built on Behavioral Activation, the most evidence-based behavioral
              approach for depression.
            </p>
            <ul className="onboard-promises onboard-stagger">
              <li style={{ "--i": 0 } as React.CSSProperties}>
                Your data stays on this device. We don't upload it.
              </li>
              <li style={{ "--i": 1 } as React.CSSProperties}>
                No diagnoses, no judgments, no shame.
              </li>
              <li style={{ "--i": 2 } as React.CSSProperties}>
                Support is always one tap away if you need it.
              </li>
            </ul>
            <p className="muted">
              We'll start with a short, standard check-in. It takes a few
              minutes — go at your own pace.
            </p>
            <button className="btn btn--primary btn--block" onClick={() => go("phq9")}>
              Begin
            </button>
          </section>
        )}

        {step === "phq9" && (
          <StepWrap
            title="Over the last 2 weeks…"
            subtitle="How often have you been bothered by the following? (PHQ-9, a standard screen)"
          >
            <div className="stack onboard-items onboard-stagger">
              {PHQ9_ITEMS.map((prompt, i) => (
                <div key={i} style={{ "--i": i } as React.CSSProperties}>
                  <Likert
                    prompt={`${i + 1}. ${prompt}`}
                    options={PHQ9_OPTIONS}
                    value={phq9[i] >= 0 ? phq9[i] : null}
                    sensitive={i === 8}
                    onChange={(v) =>
                      setPhq9((prev) => prev.map((x, j) => (j === i ? v : x)))
                    }
                  />
                </div>
              ))}
            </div>
            <NextButton
              disabled={!phq9Result}
              onClick={() => go(phq9Result?.safetyFlag ? "safety" : "axis")}
            />
          </StepWrap>
        )}

        {step === "safety" && (
          <section className="stack">
            <div className="onboard-safety-lead">
              <h1>Thank you for being honest.</h1>
              <p>
                You mentioned thoughts of being better off dead or of hurting
                yourself. That matters, and you deserve support right now.
              </p>
            </div>
            <SafetyScreen embedded />
            <button
              className="btn btn--primary btn--block"
              onClick={() => go("axis")}
            >
              I'm okay to continue for now
            </button>
          </section>
        )}

        {step === "axis" && (
          <StepWrap
            title="Two more sets of feelings"
            subtitle="This places you on the two dimensions the app tracks — reward and load. There are no right answers."
          >
            <div className="stack onboard-items onboard-stagger">
              {AXIS_ITEMS.map((item, i) => (
                <div key={i} style={{ "--i": i } as React.CSSProperties}>
                  <Likert
                    prompt={item.prompt}
                    options={AXIS_OPTIONS}
                    value={axis[i] >= 0 ? axis[i] : null}
                    onChange={(v) =>
                      setAxis((prev) => prev.map((x, j) => (j === i ? v : x)))
                    }
                  />
                </div>
              ))}
            </div>
            <NextButton disabled={!axisScores} onClick={() => go("profile")} />
          </StepWrap>
        )}

        {step === "profile" && profileKey && (
          <section className="stack onboard-profile">
            <span className="onboard-bloom" aria-hidden />
            <span className="eyebrow">Your starting picture</span>
            <h1>{PROFILES[profileKey].title}</h1>
            <p>{PROFILES[profileKey].blurb}</p>
            <div className="panel stack-sm">
              <h3>What tends to help here</h3>
              <ul className="onboard-recs onboard-stagger">
                {PROFILES[profileKey].recommendations.map((r, i) => (
                  <li key={i} style={{ "--i": i } as React.CSSProperties}>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <p className="muted">
              This is a starting point that shapes suggestions — not a diagnosis,
              and it'll move as your data grows.
            </p>
            <button className="btn btn--primary btn--block" onClick={() => go("values")}>
              Makes sense
            </button>
          </section>
        )}

        {step === "values" && (
          <StepWrap
            title="What matters to you?"
            subtitle="Pick 2–3. This points your activities at something you actually care about."
          >
            <div className="chiprow onboard-stagger">
              {VALUES.map((v, i) => {
                const on = values.includes(v.tag);
                return (
                  <button
                    key={v.tag}
                    style={{ "--i": i } as React.CSSProperties}
                    className={`pill ${on ? "is-selected" : ""}`}
                    aria-pressed={on}
                    onClick={() =>
                      setValues((prev) =>
                        on ? prev.filter((t) => t !== v.tag) : [...prev, v.tag],
                      )
                    }
                  >
                    {v.tag}
                  </button>
                );
              })}
            </div>
            <NextButton
              disabled={values.length === 0}
              label={values.length ? "Next" : "Pick at least one"}
              onClick={() => {
                setActivities(suggestedActivities);
                go("activities");
              }}
            />
          </StepWrap>
        )}

        {step === "activities" && (
          <StepWrap
            title="Pick 1–3 to track"
            subtitle="Pre-filled from what you value. You can change these anytime."
          >
            <div className="chiprow onboard-stagger">
              {suggestedActivities.map((a, i) => {
                const on = activities.includes(a);
                return (
                  <button
                    key={a}
                    style={{ "--i": i } as React.CSSProperties}
                    className={`pill ${on ? "is-selected" : ""}`}
                    aria-pressed={on}
                    onClick={() =>
                      setActivities((prev) =>
                        on ? prev.filter((x) => x !== a) : [...prev, a],
                      )
                    }
                  >
                    {a}
                  </button>
                );
              })}
            </div>
            <NextButton
              disabled={activities.length === 0}
              label={activities.length ? "Next" : "Pick at least one"}
              onClick={() => go("firstlog")}
            />
          </StepWrap>
        )}

        {step === "firstlog" && (
          <StepWrap
            title="One last thing — how are you right now?"
            subtitle="Tap where you are on the pad. This is your first entry."
          >
            <MoodGrid value={firstMood} onChange={setFirstMood} />
            <div className="panel stack">
              <PMSlider
                label="Pleasure"
                hint="enjoyable?"
                value={firstP}
                onChange={setFirstP}
                accent
              />
              <PMSlider
                label="Mastery"
                hint="any accomplishment?"
                value={firstM}
                onChange={setFirstM}
              />
            </div>
            <button
              className="btn btn--primary btn--block"
              disabled={!firstMood}
              onClick={finish}
            >
              {firstMood ? "Finish & see my dashboard" : "Tap the pad to finish"}
            </button>
          </StepWrap>
        )}
        </div>
      </main>
    </div>
  );
}

function StepWrap({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="stack">
      <header className="onboard-step-head">
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function NextButton({
  disabled,
  onClick,
  label = "Next",
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      className="btn btn--primary btn--block onboard-next"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
