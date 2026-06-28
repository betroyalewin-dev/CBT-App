import { useMemo } from "react";
import "./BALoopDiagram.css";

/**
 * The one idea Behavioral Activation rests on, told without a paragraph:
 * withdrawal feeds low mood in a tightening spiral (cool, inward) — and one
 * small valued action at the centre opens a way back out (warm, upward).
 *
 * Motion is calm and draws once; reduced-motion users get the finished picture.
 */
const CX = 120;
const CY = 104;

function spiralPath(): string {
  const turns = 3.1;
  const tMax = turns * 2 * Math.PI;
  const rMax = 80;
  const rMin = 11;
  const steps = 220;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tMax;
    const r = rMin + (rMax - rMin) * (1 - t / tMax);
    // start at the top, wind clockwise inward
    const a = -Math.PI / 2 + t;
    const x = CX + r * Math.cos(a);
    const y = CY + r * Math.sin(a);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d.trim();
}

export function BALoopDiagram() {
  const spiral = useMemo(spiralPath, []);

  return (
    <div className="ba-loop">
      <svg
        viewBox="0 0 240 208"
        width="100%"
        role="img"
        aria-label="A tightening downward spiral of doing less and feeling worse, with one small action at the centre opening a path back upward."
      >
        {/* the downward loop: withdrawal feeding low mood, winding inward */}
        <path className="ba-spiral" d={spiral} pathLength={100} fill="none" />

        {/* a muted marker caught circling the loop */}
        <g className="ba-orbit">
          <circle cx={CX} cy={CY - 80} r="4.5" className="ba-orbit-dot" />
        </g>

        {/* the way out: a warm action at the centre arcs up and out */}
        <path
          className="ba-open"
          d={`M${CX} ${CY} C ${CX + 30} ${CY - 26}, ${CX + 52} ${CY - 60}, ${CX + 62} ${CY - 92}`}
          pathLength={100}
          fill="none"
        />
        <path
          className="ba-open-head"
          d={`M${CX + 50} ${CY - 84} L ${CX + 62} ${CY - 92} L ${CX + 60} ${CY - 78}`}
          pathLength={100}
          fill="none"
        />

        {/* the small valued action itself */}
        <circle className="ba-seed" cx={CX} cy={CY} r="8" />
      </svg>

      <p className="ba-caption">
        <span className="ba-caption-cool">Doing less feeds the low.</span>{" "}
        <span className="ba-caption-warm">One small thing starts the way back.</span>
      </p>
    </div>
  );
}
