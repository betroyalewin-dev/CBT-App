import type { AxisScores, QuadrantKey } from "../domain/types";
import { QUADRANT_META } from "../domain/mood";
import "./QuadrantPad.css";

interface Props {
  axis: AxisScores;
  quadrant: QuadrantKey;
  hasData: boolean;
  /**
   * Map mode: washes, axes and the dot only. Use when the quadrant name and
   * values are rendered as real text next to the pad — the pad becomes a
   * compact position map instead of a full labeled chart.
   */
  compact?: boolean;
}

// x = reward (left: nothing lands … right: things land)
// y = stress (top: overloaded … bottom: calm)
const QUADS: { key: QuadrantKey; pos: "tl" | "tr" | "bl" | "br"; label: string }[] = [
  { key: "flat", pos: "tl", label: "Drowning · flat" },
  { key: "stressed", pos: "tr", label: "Busy · rewarding" },
  { key: "numb", pos: "bl", label: "Calm · flat" },
  { key: "thriving", pos: "br", label: "Engaged · calm" },
];

export function QuadrantPad({ axis, quadrant, hasData, compact = false }: Props) {
  const x = axis.reward;
  const y = 100 - axis.stress;

  return (
    <div className={compact ? "qp qp--compact" : "qp"}>
      <div
        className="qp-pad"
        role="img"
        aria-label={
          hasData
            ? `Your recent position: ${QUADRANT_META[quadrant].title}. Reward ${axis.reward} of 100, load ${axis.stress} of 100.`
            : "Not enough data yet. Log a few times to see your position."
        }
      >
        {QUADS.map((q) => (
          <span
            key={q.key}
            className={`qp-q qp-q--${q.pos} qp-q--${q.key} ${
              hasData && q.key === quadrant ? "is-current" : ""
            }`}
            aria-hidden
          />
        ))}

        <span className="qp-axis qp-axis--v" aria-hidden />
        <span className="qp-axis qp-axis--h" aria-hidden />

        {!compact &&
          QUADS.map((q) => (
            <span
              key={q.key}
              className={`qp-label qp-label--${q.pos} ${
                q.key === quadrant && hasData ? "is-current" : ""
              }`}
            >
              {q.label}
            </span>
          ))}

        {!compact && (
          <>
            <span className="qp-edge qp-edge--top">overloaded</span>
            <span className="qp-edge qp-edge--bottom">calm</span>
            <span className="qp-edge qp-edge--left">nothing lands</span>
            <span className="qp-edge qp-edge--right">things land</span>
          </>
        )}

        {hasData && (
          <span
            className={`qp-dot qp-dot--${quadrant}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        )}
      </div>
    </div>
  );
}
