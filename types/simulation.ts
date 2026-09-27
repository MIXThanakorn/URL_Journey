export type StageId =
  | "url-parse"
  | "dns"
  | "tcp"
  | "tls"
  | "http-request"
  | "http-response"
  | "render"
  | "complete";

export type RunStatus = "ready" | "running" | "paused" | "completed" | "error";
export type StageStatus = "pending" | "active" | "complete" | "error";

export interface UrlInfo {
  protocol: string;
  host: string;
  port: string;
  path: string;
  query: string;
  fragment: string;
  secure: boolean;
}

export interface SimulationStage {
  id: StageId;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  technical: string;
  duration: number;
  concepts: readonly string[];
}

export interface SimulationState {
  status: RunStatus;
  activeIndex: number;
  selectedIndex: number;
  progress: number;
  url: string;
  parsedUrl: UrlInfo;
  elapsed: number;
}

export type SimulationAction =
  | { type: "START"; url: string; parsedUrl: UrlInfo }
  | { type: "TICK"; delta: number; stageCount: number }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SELECT_STAGE"; index: number }
  | { type: "REPLAY" }
  | { type: "RESET"; url: string; parsedUrl: UrlInfo };
