import type { SimulationAction, SimulationOptions, SimulationState, UrlInfo } from "@/types/simulation";

export const DEFAULT_URL = "https://example.com/products?id=42#reviews";
export const DEFAULT_OPTIONS: SimulationOptions = {
  networkProfile: "4g",
  errorScenario: "none",
  method: "GET",
  responseStatus: 200,
  contentType: "text/html",
  httpVersion: "http-2",
  visitMode: "first",
};

export function createInitialState(url: string, parsedUrl: UrlInfo): SimulationState {
  return {
    status: "ready",
    activeIndex: 0,
    selectedIndex: 0,
    progress: 0,
    url,
    parsedUrl,
    elapsed: 0,
    ...DEFAULT_OPTIONS,
  };
}

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction,
): SimulationState {
  switch (action.type) {
    case "START":
      return {
        ...createInitialState(action.url, action.parsedUrl),
        status: "running",
        ...action.options,
      };
    case "TICK": {
      if (state.status !== "running") return state;
      const nextProgress = state.progress + (action.delta / action.duration) * 100;
      if (nextProgress < 100) {
        return { ...state, progress: nextProgress, elapsed: state.elapsed + action.delta };
      }
      if (action.failsHere) {
        return {
          ...state,
          status: "error",
          progress: 100,
          selectedIndex: state.activeIndex,
          elapsed: state.elapsed + action.delta,
        };
      }
      if (state.activeIndex >= action.stageCount - 1) {
        return {
          ...state,
          status: "completed",
          progress: 100,
          selectedIndex: state.activeIndex,
          elapsed: state.elapsed + action.delta,
        };
      }
      return {
        ...state,
        activeIndex: state.activeIndex + 1,
        selectedIndex: state.activeIndex + 1,
        progress: 0,
        elapsed: state.elapsed + action.delta,
      };
    }
    case "TOGGLE_PAUSE":
      if (state.status === "running") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "running" };
      return state;
    case "SELECT_STAGE":
      return { ...state, selectedIndex: action.index };
    case "JUMP_STAGE":
      return { ...state, activeIndex: action.index, selectedIndex: action.index, progress: 0 };
    case "SET_PROGRESS":
      return { ...state, progress: Math.min(100, Math.max(0, action.progress)) };
    case "REPLAY":
      return { ...state, status: "running", activeIndex: 0, selectedIndex: 0, progress: 0, elapsed: 0 };
    case "RESET":
      return createInitialState(action.url, action.parsedUrl);
    default:
      return state;
  }
}
