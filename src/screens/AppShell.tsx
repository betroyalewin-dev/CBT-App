import { Outlet } from "react-router-dom";
import { TabBar } from "../components/TabBar";
import { XpReward } from "../components/XpReward";
import { RecheckReminder } from "../components/RecheckReminder";
import "./AppShell.css";

export function AppShell() {
  return (
    <div className="app-frame">
      <header className="appbar">
        <div className="appbar-brand">
          <span className="appbar-mark" aria-hidden />
          <span className="appbar-name">Companion</span>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <XpReward />
      <RecheckReminder />
      <TabBar />
    </div>
  );
}
