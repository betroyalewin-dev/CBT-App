import type { AxisScores, QuadrantKey } from "../domain/types";
import { QUADRANT_META } from "../domain/mood";
import "./QuadrantPad.css";

interface Props {
  axis: AxisScores;
  quadrant: QuadrantKey;
  hasData: boolean;
}

const QUADRANT_LABELS: { key: QuadrantKey; label: string; pos: string }[] = [
  { key: "thriving", label: "Engaged · calm", pos: "tr" },
  { key: "stressed", label: "Busy · rewarding", pos: "tl" },
  { key: "numb", label: "Calm · flat", pos: "br" },
  { key: "flat", label: "Drowning · flat", pos: "bl" },
];

export function QuadrantPad({ axis, quadrant, hasData }: Props) {
  // x = reward (0 left … 100 right); y = stress (0 bottom calm … 100 top overloaded)
  const x = axis.reward;
  const y = 100 - axis.stress;

  return (
    <div className="qp">
      <div
        className="qp-pad"
        role="img"
        aria-label={
          hasData
            ? `Your recent position: ${QUADRANT_META[quadrant].title}. Reward ${axis.reward} of 100, load ${axis.stress} of 100.`
            : "Not enough data yet — log a few times to see your position."
        }
      >
        <span className="qp-q qp-q--tr" aria-hidden />
        <span className="qp-q qp-q--tl" aria-hidden />
        <span className="qp-q qp-q--br" aria-hidden />
        <span className="qp-q qp-q--bl" aria-hidden />

        <span className="qp-axis qp-axis--v" aria-hidden />
        <span className="qp-axis qp-axis--h" aria-hidden />

        {QUADRANT_LABELS.map((q) => (
          <span
            key={q.key}
            className={`qp-label qp-label--${q.pos} ${
              q.key === quadrant && hasData ? "is-current" : ""
            }`}
          >
            {q.label}
          </span>
        ))}

        <span className="qp-edge qp-edge--top">overloaded</span>
        <span className="qp-edge qp-edge--bottom">calm</span>
        <span className="qp-edge qp-edge--left">nothing lands</span>
        <span className="qp-edge qp-edge--right">things land</span>

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
