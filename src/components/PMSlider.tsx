import "./PMSlider.css";

interface Props {
  label: string;
  hint: string;
  value: number; // 0–10
  onChange: (v: number) => void;
  accent?: boolean;
}

export function PMSlider({ label, hint, value, onChange, accent }: Props) {
  const id = `pm-${label.toLowerCase()}`;
  return (
    <div className="pm">
      <div className="pm-head">
        <label htmlFor={id} className="pm-label">
          {label}
          <span className="muted pm-hint"> · {hint}</span>
        </label>
        <span className="mono pm-value" aria-hidden>
          {value}
        </span>
      </div>
      <input
        id={id}
        className={accent ? "pm-range pm-range--accent" : "pm-range"}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${value} out of 10`}
      />
    </div>
  );
}
