import { useState } from "react";
import { useStore } from "../store/store";
import type { SafetyPlan } from "../domain/types";
import "./SafetyScreen.css";

const PLAN_FIELDS: {
  key: keyof Omit<SafetyPlan, "updatedAt">;
  label: string;
  hint: string;
}[] = [
  { key: "warningSigns", label: "My warning signs", hint: "Thoughts, feelings, or situations that tell me things are getting hard." },
  { key: "copingSteps", label: "Things that help me cope", hint: "What I can do on my own to feel steadier." },
  { key: "contacts", label: "People I can reach", hint: "Names and numbers I can contact." },
  { key: "reasonsForLiving", label: "My reasons for living", hint: "What matters to me, what I'm holding on for." },
];

export function SafetyScreen({ embedded = false }: { embedded?: boolean }) {
  const { state, dispatch } = useStore();
  const [plan, setPlan] = useState<SafetyPlan>(state.safetyPlan);
  const [editing, setEditing] = useState(
    state.safetyPlan.warningSigns.length === 0,
  );

  function setField(key: keyof Omit<SafetyPlan, "updatedAt">, text: string) {
    setPlan((p) => ({
      ...p,
      [key]: text.split("\n").map((s) => s.trim()).filter(Boolean),
    }));
  }

  function save() {
    dispatch({ type: "saveSafetyPlan", plan });
    setEditing(false);
  }

  return (
    <div className="stack safety">
      <section className="safety-crisis">
        <p className="safety-lead">
          If things feel like too much right now, you don't have to handle it
          alone. Reaching out is a strong move, not a weak one.
        </p>
        <div className="safety-actions">
          <a className="btn btn--primary btn--block safety-call" href="tel:988">
            Call 988 — Suicide &amp; Crisis Lifeline
          </a>
          <a className="btn btn--block safety-text" href="sms:988">
            Text 988
          </a>
          <a
            className="btn btn--ghost btn--block"
            href="tel:911"
          >
            Call 911 (immediate danger)
          </a>
        </div>
        <p className="muted safety-note">
          988 is free, confidential, and available 24/7 in the US. If you're
          outside the US, contact your local emergency number or a crisis line.
        </p>
      </section>

      <Breathing />

      <section className="panel stack">
        <div className="safety-plan-head">
          <h2>My safety plan</h2>
          {!editing && (
            <button className="btn btn--ghost" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
        <p className="muted">
          Write this while you're feeling steady, so it's ready when you need it.
        </p>

        {editing ? (
          <div className="stack">
            {PLAN_FIELDS.map((f) => (
              <label key={f.key} className="stack-sm safety-field">
                <span className="safety-field-label">{f.label}</span>
                <span className="muted safety-field-hint">{f.hint}</span>
                <textarea
                  rows={3}
                  defaultValue={plan[f.key].join("\n")}
                  placeholder="One per line…"
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              </label>
            ))}
            <button className="btn btn--primary btn--block" onClick={save}>
              Save my plan
            </button>
          </div>
        ) : (
          <div className="stack">
            {PLAN_FIELDS.map((f) => (
              <div key={f.key} className="safety-readback">
                <h3>{f.label}</h3>
                {plan[f.key].length ? (
                  <ul>
                    {plan[f.key].map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">— not filled in yet —</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {embedded && (
        <p className="muted">
          You can always reach this from the shield in the bottom bar.
        </p>
      )}
    </div>
  );
}

function Breathing() {
  const [on, setOn] = useState(false);
  return (
    <section className="panel breathe">
      <div className="breathe-head">
        <h3>Take a slow breath</h3>
        <button
          className="btn btn--ghost"
          onClick={() => setOn((v) => !v)}
          aria-pressed={on}
        >
          {on ? "Stop" : "Start"}
        </button>
      </div>
      <div className="breathe-stage" aria-hidden={!on}>
        <span className={on ? "breathe-orb is-on" : "breathe-orb"} />
        <span className="breathe-word">{on ? "in… and out…" : "tap start"}</span>
      </div>
    </section>
  );
}
