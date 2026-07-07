import "./LockedTeaser.css";

/** Minimal "not unlocked yet" card — states the requirement, nothing else. */
export function LockedTeaser({ title, need }: { title: string; need: string }) {
  return (
    <div className="panel locked-teaser">
      <span className="locked-teaser-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="22" height="22">
          <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <h3>{title}</h3>
        <p className="muted">{need}</p>
      </div>
    </div>
  );
}
