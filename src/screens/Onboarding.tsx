import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, newId } from "../store/store";
import { Likert } from "../components/Likert";
import { MoodGrid } from "../components/MoodGrid";
import { PMSlider } from "../components/PMSlider";
import { StepsDiagram } from "../components/StepsDiagram";
import { LoopDiagram } from "../components/LoopDiagram";
import { SafetyScreen } from "./SafetyScreen";
import { PHQ9_ITEMS, PHQ9_OPTIONS, scorePHQ9 } from "../domain/phq9";
import { AXIS_ITEMS, AXIS_OPTIONS, scoreAxisPlacement } from "../domain/axis";
import { assignProfile, PROFILES } from "../domain/profiles";
import type { MoodPoint, PHQ9Result } from "../domain/types";
import "./Onboarding.css";

type Step =
  | "welcome"
  | "loop"
  | "phq9"
  | "safety"
  | "axis"
  | "profile"
  | "values"
  | "seed"
  | "firstlog";

/** A few gentle, non-shaming starters for the "drains you" bucket. */
const DRAINING_SUGGESTIONS = [
  "Scrolling my phone",
  "Chores / admin",
  "Staying in bed",
  "Bad news",
];

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
  // One-question-per-page cursors for the two screened sections.
  const [phq9Index, setPhq9Index] = useState(0);
  const [axisIndex, setAxisIndex] = useState(0);
  // Brief lock while a chosen answer settles before the page turns.
  const [locked, setLocked] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  /** Record an answer, let it register, then turn to the next question/section. */
  function answerQuestion(section: "phq9" | "axis", value: number) {
    if (locked) return;
    setLocked(true);
    const isPhq = section === "phq9";
    const items = isPhq ? PHQ9_ITEMS : AXIS_ITEMS;
    const index = isPhq ? phq9Index : axisIndex;
    const next = (isPhq ? phq9 : axis).map((x, j) => (j === index ? value : x));
    if (isPhq) setPhq9(next);
    else setAxis(next);

    advanceTimer.current = window.setTimeout(() => {
      setLocked(false);
      setDir("fwd");
      if (index < items.length - 1) {
        if (isPhq) setPhq9Index(index + 1);
        else setAxisIndex(index + 1);
      } else if (isPhq) {
        go(scorePHQ9(next).safetyFlag ? "safety" : "axis");
      } else {
        go("profile");
      }
    }, 240);
  }

  /** Back that steps through questions first, then out to the prior section. */
  function goBack() {
    if (locked) return;
    if (step === "phq9" && phq9Index > 0) {
      setDir("back");
      setPhq9Index(phq9Index - 1);
    } else if (step === "axis" && axisIndex > 0) {
      setDir("back");
      setAxisIndex(axisIndex - 1);
    } else {
      back();
    }
  }

  const canGoBack =
    history.length > 0 ||
    (step === "phq9" && phq9Index > 0) ||
    (step === "axis" && axisIndex > 0);
  const [values, setValues] = useState<string[]>([]);
  // Seed activities, elicited as "what lifts you" vs "what drains you".
  const [liked, setLiked] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
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

  // Both buckets become trackable activities — the app discovers from real logs
  // whether each one actually lifts or drains; the buckets are just the prompt.
  const seededActivities = useMemo(
    () => [...new Set([...liked, ...disliked])],
    [liked, disliked],
  );

  function finish() {
    if (!phq9Result || !axisScores || !profileKey || !firstMood) return;
    dispatch({
      type: "completeOnboarding",
      payload: {
        phq9: phq9Result,
        axis: axisScores,
        profile: profileKey,
        values,
        activities: seededActivities.length ? seededActivities : suggestedActivities,
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

  // Granular progress: each PHQ-9 / axis question is its own atom, so the bar
  // ticks forward with every page, not just every section.
  const PHQ9_N = PHQ9_ITEMS.length;
  const AXIS_N = AXIS_ITEMS.length;
  const atomBase: Record<Exclude<Step, "safety">, number> = {
    welcome: 0,
    loop: 1,
    phq9: 2,
    axis: 2 + PHQ9_N,
    profile: 2 + PHQ9_N + AXIS_N,
    values: 3 + PHQ9_N + AXIS_N,
    seed: 4 + PHQ9_N + AXIS_N,
    firstlog: 5 + PHQ9_N + AXIS_N,
  };
  const totalAtoms = 6 + PHQ9_N + AXIS_N; // last atom index = totalAtoms − 1
  const currentAtom =
    step === "safety"
      ? null
      : atomBase[step] +
        (step === "phq9" ? phq9Index : step === "axis" ? axisIndex : 0);
  const progress =
    currentAtom === null ? null : (currentAtom / (totalAtoms - 1)) * 100;

  const stageKey =
    step === "phq9"
      ? `phq9-${phq9Index}`
      : step === "axis"
        ? `axis-${axisIndex}`
        : step;

  return (
    <div className="app-frame">
      <main className="app-main onboard">
        <div className="onboard-topbar">
          <button
            type="button"
            className={`onboard-back ${canGoBack ? "" : "is-hidden"}`}
            onClick={goBack}
            aria-label="Go back"
            tabIndex={canGoBack ? 0 : -1}
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

        <div className="onboard-stage" key={stageKey} data-dir={dir} data-step={step}>
        {/* Page 1 — the feedback loop that keeps depression going */}
        {step === "welcome" && (
          <section className="stack onboard-explain">
            <header className="onboard-step-head">
              <h1>Depression runs on a loop</h1>
            </header>
            <LoopDiagram />
            <p>
              When your mood drops, it's natural to do less. You cancel,
              withdraw, wait for energy that doesn't come. But doing less means
              fewer of the small moments that would lift you, so your mood sinks
              a little further, and the next thing feels even harder.
            </p>
            <p className="muted">
              That's the loop. It's not a character flaw, it's how the
              illness keeps itself going.
            </p>
            <button
              className="btn btn--primary btn--block"
              onClick={() => go("loop")}
            >
              So how do you break it?
            </button>
          </section>
        )}

        {/* Page 2 — how Behavioral Activation works the loop in reverse */}
        {step === "loop" && (
          <section className="stack onboard-explain">
            <header className="onboard-step-head">
              <h1>Behavioral Activation turns it around</h1>
            </header>
            <StepsDiagram />
            <p>
              Instead of waiting to feel better before you do things, you do one
              small thing first. A little reward nudges your mood up, which
              makes the next thing a bit easier. That's how the loop runs
              in reverse.
            </p>
            <p>
              The catch: what actually feels rewarding is different for everyone.
              A walk lifts one person and does nothing for the next. So this app
              helps you find the activities that genuinely move <em>your</em>{" "}
              mood, and shows you the improvement as it adds up.
            </p>
            <p className="muted onboard-trust">
              Everything stays on your device. It's a companion, not a doctor,
              and support is always one tap away.
            </p>
            <button
              className="btn btn--primary btn--block"
              onClick={() => go("phq9")}
            >
              Start the check-in
            </button>
          </section>
        )}

        {step === "phq9" && (
          <QuestionPage
            sectionLabel="The check-in"
            stepText={`${phq9Index + 1} of ${PHQ9_ITEMS.length}`}
            context="Over the last 2 weeks, how often have you been bothered by…"
            prompt={PHQ9_ITEMS[phq9Index]}
            options={PHQ9_OPTIONS}
            value={phq9[phq9Index] >= 0 ? phq9[phq9Index] : null}
            sensitive={phq9Index === 8}
            locked={locked}
            onChange={(v) => answerQuestion("phq9", v)}
          />
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
          <QuestionPage
            sectionLabel="Your picture"
            stepText={`${axisIndex + 1} of ${AXIS_ITEMS.length}`}
            context="There are no right answers, just go with your gut."
            prompt={AXIS_ITEMS[axisIndex].prompt}
            options={AXIS_OPTIONS}
            value={axis[axisIndex] >= 0 ? axis[axisIndex] : null}
            locked={locked}
            onChange={(v) => answerQuestion("axis", v)}
          />
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
              This is a starting point that shapes suggestions, not a diagnosis.
              It'll move as your data grows.
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
              onClick={() => go("seed")}
            />
          </StepWrap>
        )}

        {step === "seed" && (
          <StepWrap
            title="What lifts you, and what drains you?"
            subtitle="Add a few of each. These become your starting list to log. Over time, your data shows which ones really do what."
          >
            <SeedBucket
              tone="lift"
              label="Tends to lift me"
              hint="things you usually feel better during or after"
              items={liked}
              suggestions={suggestedActivities.filter(
                (s) => !liked.includes(s),
              )}
              onAdd={(v) =>
                setLiked((p) => (p.includes(v) ? p : [...p, v]))
              }
              onRemove={(v) => setLiked((p) => p.filter((x) => x !== v))}
            />
            <SeedBucket
              tone="drain"
              label="Tends to drain me"
              hint="things that usually leave you worse, worth watching, not avoiding"
              items={disliked}
              suggestions={DRAINING_SUGGESTIONS.filter(
                (s) => !disliked.includes(s),
              )}
              onAdd={(v) =>
                setDisliked((p) => (p.includes(v) ? p : [...p, v]))
              }
              onRemove={(v) => setDisliked((p) => p.filter((x) => x !== v))}
            />
            <NextButton
              disabled={liked.length + disliked.length === 0}
              label={
                liked.length + disliked.length === 0
                  ? "Add at least one"
                  : "Next"
              }
              onClick={() => go("firstlog")}
            />
          </StepWrap>
        )}

        {step === "firstlog" && (
          <StepWrap
            title="One last thing: how are you right now?"
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

function SeedBucket({
  tone,
  label,
  hint,
  items,
  suggestions,
  onAdd,
  onRemove,
}: {
  tone: "lift" | "drain";
  label: string;
  hint: string;
  items: string[];
  suggestions: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [draft, setDraft] = useState("");
  function commit() {
    const v = draft.trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
  }
  return (
    <section className={`seed-bucket seed-bucket--${tone}`}>
      <header className="seed-bucket-head">
        <span className="seed-bucket-label">{label}</span>
        <span className="muted seed-bucket-hint">{hint}</span>
      </header>

      {items.length > 0 && (
        <div className="chiprow">
          {items.map((it) => (
            <button
              key={it}
              type="button"
              className="pill is-selected seed-chip"
              onClick={() => onRemove(it)}
              aria-label={`Remove ${it}`}
            >
              {it}
              <span className="seed-chip-x" aria-hidden>
                ×
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="seed-add">
        <input
          className="seed-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={
            tone === "lift" ? "add something that helps…" : "add something draining…"
          }
          aria-label={`Add to ${label}`}
        />
        <button
          type="button"
          className="btn btn--ghost seed-add-btn"
          onClick={commit}
          disabled={!draft.trim()}
        >
          Add
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="chiprow seed-suggestions">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="pill seed-suggest"
              onClick={() => onAdd(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function QuestionPage({
  sectionLabel,
  stepText,
  context,
  prompt,
  options,
  value,
  sensitive,
  locked,
  onChange,
}: {
  sectionLabel: string;
  stepText: string;
  context: string;
  prompt: string;
  options: { value: number; label: string }[];
  value: number | null;
  sensitive?: boolean;
  locked: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <section className="stack onboard-qpage">
      <header className="onboard-qhead">
        <span className="eyebrow onboard-qsection">
          {sectionLabel} · {stepText}
        </span>
        <p className="muted onboard-qcontext">{context}</p>
      </header>
      <div className={`likert-solo ${locked ? "is-locked" : ""}`}>
        <Likert
          prompt={prompt}
          options={options}
          value={value}
          sensitive={sensitive}
          onChange={onChange}
        />
      </div>
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
