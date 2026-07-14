import "./LoopDiagram.css";

/**
 * The depression maintenance cycle, drawn the way CBT worksheets draw it: labelled
 * stages in boxes, joined by arrows that name the causal link ("so you pull
 * back…"), with a return arrow looping back to the top so the self-feeding cycle
 * is explicit. A current of light flows down the chain and round again, lighting
 * each stage in turn. Draws once; reduced-motion users get the finished picture.
 */

interface Card {
  y: number;
  label: string;
  phase: number; // 0..1 around the cycle, when the current reaches it
  enter: number; // intro stagger index
}

const CARDS: Card[] = [
  { y: 14, label: "Low mood", phase: 0.0, enter: 0 },
  { y: 126, label: "Do less, withdraw", phase: 0.26, enter: 1 },
  { y: 238, label: "Fewer rewards", phase: 0.52, enter: 2 },
];

const ARROWS: { d: string; phase: number }[] = [
  { d: "M150 70 L150 118", phase: 0.13 },
  { d: "M150 182 L150 230", phase: 0.39 },
];

const CONNECTORS: { x: number; y: number; text: string }[] = [
  { x: 165, y: 99, text: "so you pull back" },
  { x: 165, y: 211, text: "so less good lands" },
];

// down → left → up → into the top card: makes the loop explicit
const RETURN_D =
  "M150 288 L150 312 Q150 326 136 326 L50 326 Q36 326 36 312 L36 53 Q36 39 50 39 L62 39";

export function LoopDiagram() {
  return (
    <div className="dl">
      <svg
        viewBox="0 0 300 350"
        width="100%"
        role="img"
        aria-label="A maintenance cycle: low mood leads you to do less and withdraw, which means fewer rewarding moments, which lowers mood further, and round again."
      >
        <defs>
          <marker
            id="dl-arrow"
            viewBox="0 0 10 10"
            refX="7.5"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path className="dl-arrowhead" d="M0 0 L10 5 L0 10 Z" />
          </marker>
        </defs>

        {/* flow arrows (behind the cards) */}
        {ARROWS.map((a, i) => (
          <path
            key={i}
            className="dl-flow"
            d={a.d}
            fill="none"
            markerEnd="url(#dl-arrow)"
            style={{ "--phase": a.phase } as React.CSSProperties}
          />
        ))}
        <path
          className="dl-flow dl-return"
          d={RETURN_D}
          fill="none"
          markerEnd="url(#dl-arrow)"
          style={{ "--phase": 0.74 } as React.CSSProperties}
        />

        {CONNECTORS.map((c, i) => (
          <text key={i} className="dl-conn" x={c.x} y={c.y}>
            {c.text}
          </text>
        ))}
        <text className="dl-conn" x={95} y={344} textAnchor="middle">
          …and round again
        </text>

        {CARDS.map((c) => (
          <g
            className="dl-card"
            key={c.label}
            style={{ "--enter": c.enter } as React.CSSProperties}
          >
            <rect
              className="dl-box"
              x={64}
              y={c.y}
              width={172}
              height={50}
              rx={13}
              style={{ "--phase": c.phase } as React.CSSProperties}
            />
            <text
              className="dl-label"
              x={150}
              y={c.y + 25}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
