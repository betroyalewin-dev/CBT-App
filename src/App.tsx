import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider, useStore } from "./store/store";
import { AppShell } from "./screens/AppShell";
import { Onboarding } from "./screens/Onboarding";
import { TodayScreen } from "./screens/TodayScreen";
import { LogScreen } from "./screens/LogScreen";
import { InsightsScreen } from "./screens/InsightsScreen";
import { SafetyScreen } from "./screens/SafetyScreen";

function Routed() {
  const { state } = useStore();

  if (!state.onboarded) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/log" element={<LogScreen />} />
        <Route path="/insights" element={<InsightsScreen />} />
        <Route path="/safety" element={<SafetyScreen />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routed />
      </HashRouter>
    </StoreProvider>
  );
}
