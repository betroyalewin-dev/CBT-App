import "./Likert.css";

interface Option {
  value: number;
  label: string;
}

interface Props {
  prompt: string;
  options: Option[];
  value: number | null;
  onChange: (v: number) => void;
  /** Visually flag the sensitive item (e.g. PHQ-9 item 9). */
  sensitive?: boolean;
}

export function Likert({ prompt, options, value, onChange, sensitive }: Props) {
  return (
    <fieldset className={sensitive ? "likert likert--sensitive" : "likert"}>
      <legend className="likert-prompt">{prompt}</legend>
      <div className="likert-opts" role="radiogroup" aria-label={prompt}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              className={active ? "likert-opt is-selected" : "likert-opt"}
              onClick={() => onChange(o.value)}
            >
              <span className="likert-opt-dot" aria-hidden />
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
