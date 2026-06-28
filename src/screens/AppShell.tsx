import { Outlet, useNavigate } from "react-router-dom";
import { TabBar } from "../components/TabBar";
import { XpReward } from "../components/XpReward";
import "./AppShell.css";

export function AppShell() {
  const navigate = useNavigate();
  return (
    <div className="app-frame">
      <header className="appbar">
        <div className="appbar-brand">
          <span className="appbar-mark" aria-hidden />
          <span className="appbar-name">Companion</span>
        </div>
        <button
          type="button"
          className="appbar-support"
          onClick={() => navigate("/safety")}
        >
          Need support now?
        </button>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <XpReward />
      <TabBar />
    </div>
  );
}
