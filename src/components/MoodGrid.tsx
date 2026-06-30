import { useRef, useState } from "react";
import type { MoodPoint } from "../domain/types";
import { moodPhrase, MOOD_MAX, MOOD_MIN } from "../domain/mood";
import "./MoodGrid.css";

interface Props {
  value: MoodPoint | null;
  onChange: (m: MoodPoint) => void;
  /** Optional dimmed "anticipated" marker to compare against. */
  ghost?: MoodPoint | null;
}

const SPAN = MOOD_MAX - MOOD_MIN;

function clamp(v: number) {
  return Math.max(MOOD_MIN, Math.min(MOOD_MAX, v));
}

/** valence/arousal → 0..1 fractional position (x = valence, y inverted = arousal). */
function toFrac(m: MoodPoint) {
  return {
    x: (m.valence - MOOD_MIN) / SPAN,
    y: 1 - (m.arousal - MOOD_MIN) / SPAN,
  };
}

export function MoodGrid({ value, onChange, ghost }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function place(clientX: number, clientY: number) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const fx = (clientX - r.left) / r.width;
    const fy = (clientY - r.top) / r.height;
    onChange({
      valence: Math.round(clamp(MOOD_MIN + fx * SPAN) * 10) / 10,
      arousal: Math.round(clamp(MOOD_MIN + (1 - fy) * SPAN) * 10) / 10,
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const cur = value ?? { valence: 0, arousal: 0 };
    const step = e.shiftKey ? 1 : 0.5;
    let { valence, arousal } = cur;
    if (e.key === "ArrowLeft") valence = clamp(valence - step);
    else if (e.key === "ArrowRight") valence = clamp(valence + step);
    else if (e.key === "ArrowUp") arousal = clamp(arousal + step);
    else if (e.key === "ArrowDown") arousal = clamp(arousal - step);
    else return;
    e.preventDefault();
    onChange({ valence, arousal });
  }

  const pos = value ? toFrac(value) : null;
  const gpos = ghost ? toFrac(ghost) : null;
  const phrase = value ? moodPhrase(value) : null;

  return (
    <div className="moodgrid-wrap">
      <p className="mg-readout" aria-hidden>
        {phrase ? (
          <span className="mg-readout-phrase">{phrase}</span>
        ) : (
          <span className="mg-readout-prompt">
            Move until the words match how you feel.
          </span>
        )}
      </p>

      <div
        ref={ref}
        className={`moodgrid ${value ? "is-set" : "is-empty"} ${
          dragging ? "is-dragging" : ""
        }`}
        role="slider"
        tabIndex={0}
        aria-label="Mood pad: left to right is unpleasant to pleasant, up and down is calm to high-energy"
        aria-valuetext={
          value
            ? `${phrase}. Pleasantness ${value.valence} of 5, energy ${value.arousal} of 5.`
            : "Not set — tap anywhere to place how you feel."
        }
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          setDragging(true);
          place(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging && place(e.clientX, e.clientY)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* one continuous field — corner washes bleed together, no seams */}
        <span className="mg-field" aria-hidden />

        {/* faint orientation marks: a calm "neutral" center, no hard quadrant cross */}
        <span className="mg-center" aria-hidden />

        {/* axis anchors — plain words at the edges (not corner "boxes") */}
        <span className="mg-edge mg-edge--top" aria-hidden>
          high energy
        </span>
        <span className="mg-edge mg-edge--bottom" aria-hidden>
          calm / low energy
        </span>
        <span className="mg-edge mg-edge--left" aria-hidden>
          unpleasant
        </span>
        <span className="mg-edge mg-edge--right" aria-hidden>
          pleasant
        </span>

        {gpos && (
          <span
            className="mg-dot mg-dot--ghost"
            style={{ left: `${gpos.x * 100}%`, top: `${gpos.y * 100}%` }}
            aria-hidden
          />
        )}
        {pos ? (
          <span
            className="mg-dot"
            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
            aria-hidden
          />
        ) : (
          <span className="mg-hint" aria-hidden>
            tap anywhere
          </span>
        )}
      </div>
    </div>
  );
}
