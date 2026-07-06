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
import type { Experiment } from "../domain/experiments";
import {
  upsertSample,
  type ActivitySample,
  type ActivitySourceId,
} from "../domain/activity";
import {
  awardForLog,
  awardForPhq9,
  levelFromXp,
  sumAward,
  XP,
  type AwardItem,
} from "../domain/xp";

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
  xp: 0,
  experiments: [],
  activitySources: [],
  activitySamples: [],
  lastAward: null,
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
  | { type: "addExperiment"; experiment: Experiment }
  | { type: "claimExperiment"; id: string; reason: string }
  | { type: "clearAward" }
  | { type: "connectActivitySource"; source: ActivitySourceId; samples?: ActivitySample[] }
  | { type: "disconnectActivitySource"; source: ActivitySourceId }
  | { type: "recordMovement"; sample: ActivitySample }
  | { type: "reset" };

/** Apply an XP award, bumping the total and stashing the transient animation payload. */
function applyAward(state: AppState, items: AwardItem[]): AppState {
  if (items.length === 0) return state;
  const before = levelFromXp(state.xp).level;
  const total = sumAward(items);
  const xp = state.xp + total;
  const after = levelFromXp(xp).level;
  return {
    ...state,
    xp,
    lastAward: {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      at: Date.now(),
      items,
      total,
      levelUp: after > before ? after : undefined,
    },
  };
}

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
      return applyAward(
        { ...state, logs: [...state.logs, action.log] },
        awardForLog(action.log.planned),
      );
    case "addActivity":
      return state.activities.includes(action.label)
        ? state
        : { ...state, activities: [...state.activities, action.label] };
    case "recordPHQ9":
      return applyAward(
        {
          ...state,
          phq9History: [...state.phq9History, action.result],
        },
        awardForPhq9(state.phq9History[state.phq9History.length - 1], action.result),
      );
    case "addExperiment":
      return { ...state, experiments: [...state.experiments, action.experiment] };
    case "claimExperiment": {
      let changed = false;
      const experiments = state.experiments.map((e) => {
        if (e.id === action.id && !e.claimedAt) {
          changed = true;
          return { ...e, claimedAt: Date.now() };
        }
        return e;
      });
      if (!changed) return state;
      return applyAward({ ...state, experiments }, [
        { amount: XP.experiment, reason: action.reason },
      ]);
    }
    case "clearAward":
      return state.lastAward ? { ...state, lastAward: null } : state;
    case "connectActivitySource": {
      if (state.activitySources.some((s) => s.id === action.source)) return state;
      return {
        ...state,
        activitySources: [
          ...state.activitySources,
          { id: action.source, connectedAt: Date.now() },
        ],
        activitySamples: action.samples
          ? [...state.activitySamples, ...action.samples]
          : state.activitySamples,
      };
    }
    case "disconnectActivitySource":
      // Disconnect purges that source's data — one tap, fully reversible-in.
      return {
        ...state,
        activitySources: state.activitySources.filter((s) => s.id !== action.source),
        activitySamples: state.activitySamples.filter(
          (s) => s.source !== action.source,
        ),
      };
    case "recordMovement":
      return {
        ...state,
        activitySamples: upsertSample(state.activitySamples, action.sample),
      };
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
    return {
      ...initialState,
      ...parsed,
      safetyPlan: { ...emptySafetyPlan, ...parsed.safetyPlan },
      // transient — never restore a stale reward toast on reload
      lastAward: null,
    };
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
