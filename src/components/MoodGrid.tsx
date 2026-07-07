import { useRef, useState } from "react";
import type { MoodPoint } from "../domain/types";
import { emotionRegion, MOOD_MAX, MOOD_MIN } from "../domain/mood";
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
  const region = value ? emotionRegion(value) : null;

  return (
    <div className="moodgrid-wrap">
      <div className="mg-layout">
        {/* Y-axis rail — energy level, reads bottom→top */}
        <div className="mg-y-rail" aria-hidden>
          <span className="mg-axis-endpoint">energised</span>
          <span className="mg-axis-name">Energy</span>
          <span className="mg-axis-endpoint">calm</span>
        </div>

        <div className="mg-pad-col">
          <div
            ref={ref}
            className="moodgrid"
            role="slider"
            tabIndex={0}
            aria-label="Mood pad: left–right is how you feel (unpleasant to pleasant), up–down is energy level (calm to energised)"
            aria-valuetext={
              value
                ? `${region?.label}, valence ${value.valence}, energy ${value.arousal}`
                : "not set — tap to place your mood"
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
            {/* soft quadrant field — corners identified by position + label, not color alone */}
            <span className="mg-field" aria-hidden />

            <span className="mg-axis mg-axis--v" aria-hidden />
            <span className="mg-axis mg-axis--h" aria-hidden />
            <span className="mg-origin" aria-hidden />

            <span className="mg-corner-label mg-corner-label--tl" aria-hidden>
              anxious
            </span>
            <span className="mg-corner-label mg-corner-label--tr" aria-hidden>
              excited
            </span>
            <span className="mg-corner-label mg-corner-label--bl" aria-hidden>
              flat
            </span>
            <span className="mg-corner-label mg-corner-label--br" aria-hidden>
              calm
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
              />
            ) : (
              <span className="mg-hint">tap where you are</span>
            )}
          </div>

          {/* X-axis rail — how you feel, left→right */}
          <div className="mg-x-rail" aria-hidden>
            <span className="mg-axis-endpoint">unpleasant</span>
            <span className="mg-axis-name">Feel</span>
            <span className="mg-axis-endpoint">pleasant</span>
          </div>
        </div>
      </div>

      {region && (
        <p className="mg-readout">
          <span className={`mg-readout-dot mg-readout-dot--${region.corner}`} aria-hidden />
          <strong>{region.label}</strong>
        </p>
      )}
    </div>
  );
}
