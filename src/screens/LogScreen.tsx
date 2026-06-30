import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, newId } from "../store/store";
import { MoodGrid } from "../components/MoodGrid";
import { PMSlider } from "../components/PMSlider";
import {
  ACTIVITY_CATEGORIES,
  SEED_ACTIVITY_LABELS,
} from "../domain/activities";
import type { MoodPoint } from "../domain/types";
import "./LogScreen.css";

export function LogScreen() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();

  const lastLog = state.logs[state.logs.length - 1];
  const [activity, setActivity] = useState<string>("Mood check");
  const [customActivity, setCustomActivity] = useState("");
  const [mood, setMood] = useState<MoodPoint | null>(null);
  const [pleasure, setPleasure] = useState(lastLog?.pleasure ?? 5);
  const [mastery, setMastery] = useState(lastLog?.mastery ?? 5);
  const [showDetail, setShowDetail] = useState(false);
  const [note, setNote] = useState("");

  // The user's own activities that aren't already in the seeded catalog,
  // surfaced first so their real day is a tap or two from the top.
  const yours = useMemo(() => {
    const seeded = new Set(SEED_ACTIVITY_LABELS);
    return state.activities.filter((a) => !seeded.has(a));
  }, [state.activities]);

  const label = activity === "__custom" ? customActivity.trim() : activity;
  const canSave = mood !== null && label.length > 0;

  function save() {
    if (!mood || !label) return;
    if (activity === "__custom" && label) {
      dispatch({ type: "addActivity", label });
    }
    dispatch({
      type: "addLog",
      log: {
        id: newId(),
        timestamp: Date.now(),
        activityLabel: label,
        mood,
        pleasure,
        mastery,
        planned: false,
        note: note.trim() || undefined,
      },
    });
    navigate("/today");
  }

  return (
    <div className="stack log">
      <header className="log-intro">
        <h1>How are you right now?</h1>
        <p className="muted">
          One tap on the pad is a complete entry. The rest is optional.
        </p>
      </header>

      <section className="stack-sm">
        <span className="eyebrow">What were you doing?</span>

        <div className="activity-group">
          <div className="chiprow">
            <button
              type="button"
              className={`pill ${activity === "Mood check" ? "is-selected" : ""}`}
              onClick={() => setActivity("Mood check")}
            >
              Mood check
            </button>
            <button
              type="button"
              className={`pill ${activity === "__custom" ? "is-selected" : ""}`}
              onClick={() => setActivity("__custom")}
            >
              + something else
            </button>
          </div>
        </div>

        {yours.length > 0 && (
          <div className="activity-group">
            <span className="activity-group-title">Yours</span>
            <div className="chiprow">
              {yours.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`pill ${activity === c ? "is-selected" : ""}`}
                  onClick={() => setActivity(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {ACTIVITY_CATEGORIES.map((cat) => (
          <div key={cat.key} className="activity-group">
            <span className="activity-group-title">{cat.title}</span>
            <div className="chiprow">
              {cat.activities.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className={`pill ${activity === a.label ? "is-selected" : ""}`}
                  onClick={() => setActivity(a.label)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {activity === "__custom" && (
          <input
            className="log-custom"
            autoFocus
            placeholder="name it…"
            value={customActivity}
            onChange={(e) => setCustomActivity(e.target.value)}
          />
        )}
      </section>

      <section className="stack-sm">
        <span className="eyebrow">Place your mood</span>
        <MoodGrid value={mood} onChange={setMood} />
      </section>

      <section className="panel stack">
        <PMSlider
          label="Pleasure"
          hint="how enjoyable was it?"
          value={pleasure}
          onChange={setPleasure}
          accent
        />
        <PMSlider
          label="Mastery"
          hint="any sense of accomplishment?"
          value={mastery}
          onChange={setMastery}
        />
      </section>

      {showDetail ? (
        <section className="stack-sm">
          <span className="eyebrow">Anything you want to remember?</span>
          <textarea
            className="log-note"
            rows={3}
            placeholder="A line for future-you…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </section>
      ) : (
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setShowDetail(true)}
        >
          + add a note
        </button>
      )}

      <button
        className="btn btn--primary btn--block log-save"
        disabled={!canSave}
        onClick={save}
      >
        {canSave ? "Save this moment" : "Tap the pad to save"}
      </button>
    </div>
  );
}
