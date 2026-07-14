import "./StepsDiagram.css";

/**
 * The payoff of Behavioral Activation, shown honestly: small actions accumulate
 * into an upward mood trend over time — with the odd dip, because real recovery
 * isn't a straight line. Each dot is one logged "small thing"; they pop in as the
 * line climbs. Doubles as a preview of the tracking the app actually does.
 * Draws once; reduced-motion users get the finished picture.
 */
const PTS: [number, number][] = [
  [18, 150],
  [52, 138],
  [86, 145],
  [120, 120],
  [154, 127],
  [188, 98],
  [222, 70],
];

export function StepsDiagram() {
  const d = PTS.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");

  return (
    <div className="steps-dg">
      <svg
        viewBox="0 0 240 168"
        width="100%"
        role="img"
        aria-label="A mood trend climbing over time, with small dips, as small actions add up."
      >
        <line className="steps-base" x1="10" y1="158" x2="230" y2="158" />
        <path className="steps-line" d={d} pathLength={100} fill="none" />
        {PTS.map((p, i) => (
          <circle
            key={i}
            className="steps-dot"
            cx={p[0]}
            cy={p[1]}
            r="5"
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </svg>
      <p className="steps-cap">Each point is one small thing. They add up.</p>
    </div>
  );
}
