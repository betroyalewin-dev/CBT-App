import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  ActivityLog,
  AppState,
  AxisScores,
  PHQ9Result,
  ProfileKey,
  SafetyPlan,
} from "../domain/types";

const STORAGE_KEY = "cbt-companion:v1";

const emptySafetyPlan: SafetyPlan = {
  warningSigns: [],
  copingSteps: [],
  contacts: [],
  reasonsForLiving: [],
};

const initialState: AppState = {
  onboarded: false,
  phq9History: [],
  axis: { reward: 50, stress: 50 },
  profile: undefined,
  values: [],
  activities: [],
  logs: [],
  safetyPlan: emptySafetyPlan,
  anxiousFlag: false,
};

type Action =
  | { type: "hydrate"; state: AppState }
  | {
      type: "completeOnboarding";
      payload: {
        phq9: PHQ9Result;
        axis: AxisScores;
        profile: ProfileKey;
        values: string[];
        activities: string[];
        anxiousFlag: boolean;
      };
    }
  | { type: "addLog"; log: ActivityLog }
  | { type: "addActivity"; label: string }
  | { type: "recordPHQ9"; result: PHQ9Result }
  | { type: "saveSafetyPlan"; plan: SafetyPlan }
  | { type: "reset" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "completeOnboarding":
      return {
        ...state,
        onboarded: true,
        phq9History: [...state.phq9History, action.payload.phq9],
        axis: action.payload.axis,
        profile: action.payload.profile,
        values: action.payload.values,
        activities: action.payload.activities,
        anxiousFlag: action.payload.anxiousFlag,
      };
    case "addLog":
      return { ...state, logs: [...state.logs, action.log] };
    case "addActivity":
      return state.activities.includes(action.label)
        ? state
        : { ...state, activities: [...state.activities, action.label] };
    case "recordPHQ9":
      return { ...state, phq9History: [...state.phq9History, action.result] };
    case "saveSafetyPlan":
      return {
        ...state,
        safetyPlan: { ...action.plan, updatedAt: Date.now() },
      };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...initialState, ...parsed, safetyPlan: { ...emptySafetyPlan, ...parsed.safetyPlan } };
  } catch {
    return initialState;
  }
}

interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — the app still works in-memory */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
