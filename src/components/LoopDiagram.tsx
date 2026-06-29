import { useMemo } from "react";
import "./LoopDiagram.css";

/**
 * The depression feedback loop, shown as a self-feeding cycle: low mood leads to
 * doing less, which means fewer rewarding moments, which lowers mood further. A
 * glowing pulse traces the ring and each stage lights up in turn, so the "one
 * feeds the next, round and round" causation is felt, not just read. Draws once;
 * reduced-motion users get the finished picture.
 */
const CX = 120;
const CY = 100;
const R = 66;

function pt(angDeg: number, r = R): [number, number] {
  const a = (angDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function ringPath(): string {
  const start = -74;
  const end = 254; // a near-full circle with a gap at the top
  let d = "";
  for (let a = start; a <= end; a += 4) {
    const [x, y] = pt(a);
    d += `${a === start ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d.trim();
}

function arrowHead(angDeg: number): string {
  const a = (angDeg * Math.PI) / 180;
  const [tx, ty] = pt(angDeg);
  const dir = Math.atan2(Math.cos(a), -Math.sin(a)); // clockwise tangent
  const back = dir + Math.PI;
  const len = 11;
  const spread = (26 * Math.PI) / 180;
  const p1 = [tx + len * Math.cos(back - spread), ty + len * Math.sin(back - spread)];
  const p2 = [tx + len * Math.cos(back + spread), ty + len * Math.sin(back + spread)];
  return `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
}

// `phase` = where on the ring (0..1, clockwise from the gap) the pulse passes
// each node, so the nodes light up in sequence as it goes round.
const NODES: { ang: number; label: string; phase: number }[] = [
  { ang: -90, label: "low mood", phase: 0 },
  { ang: 30, label: "do less", phase: 0.34 },
  { ang: 150, label: "less reward", phase: 0.68 },
];

export function LoopDiagram() {
  const ring = useMemo(ringPath, []);
  const head = useMemo(() => arrowHead(254), []);

  return (
    <div className="loop-dg">
      <svg
        viewBox="0 0 240 188"
        width="100%"
        role="img"
        aria-label="A self-feeding cycle: low mood leads to doing less, which means fewer rewarding moments, which lowers mood further."
      >
        <path className="loop-ring" d={ring} pathLength={100} fill="none" />
        <path className="loop-comet" d={ring} pathLength={100} fill="none" />
        <path className="loop-head" d={head} pathLength={100} fill="none" />

        {NODES.map((n) => {
          const [nx, ny] = pt(n.ang);
          const [lx, ly] = pt(n.ang, 92);
          return (
            <g className="loop-node" key={n.label}>
              <circle
                cx={nx}
                cy={ny}
                r="5.5"
                style={{ "--phase": n.phase } as React.CSSProperties}
              />
              <text x={lx} y={ly + 4} textAnchor="middle">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
