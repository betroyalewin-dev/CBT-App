import { NavLink } from "react-router-dom";
import "./TabBar.css";

const tabs = [
  { to: "/today", label: "Today", icon: TodayIcon },
  { to: "/log", label: "Log", icon: LogIcon, primary: true },
  { to: "/insights", label: "Insights", icon: InsightIcon },
  { to: "/safety", label: "Support", icon: SafetyIcon, safety: true },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Primary">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            [
              "tab",
              isActive ? "is-active" : "",
              t.primary ? "tab--primary" : "",
              t.safety ? "tab--safety" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          <t.icon />
          <span>{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function TodayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="22" height="22">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}
function LogIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="24" height="24">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function InsightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="22" height="22">
      <path d="M5 16l4-5 3 3 5-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SafetyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="22" height="22">
      <path d="M12 3l7 3v5c0 4.2-2.9 7.6-7 8.8C7.9 18.6 5 15.2 5 11V6l7-3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.3 12l1.9 1.9 3.6-3.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
