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
export type NetworkProfileId = "fast" | "4g" | "slow-4g" | "3g" | "offline" | "custom";
export type ErrorScenarioId = "none" | "dns-failure" | "connection-timeout" | "tls-error" | "404" | "500" | "slow-server" | "cors-error" | "redirect";
export type ExplanationMode = "beginner" | "developer" | "deep-dive";
export type ViewMode = "simulation" | "architecture" | "challenge";
export type HttpMethod = "GET" | "HEAD" | "POST";
export type HttpVersion = "http-1.1" | "http-2" | "http-3";
export type VisitMode = "first" | "repeat";
export type AppLocale = "en" | "th";

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
  networkProfile: NetworkProfileId;
  errorScenario: ErrorScenarioId;
  method: HttpMethod;
  responseStatus: number;
  contentType: string;
  httpVersion: HttpVersion;
  visitMode: VisitMode;
}

export type SimulationAction =
  | { type: "START"; url: string; parsedUrl: UrlInfo; options: SimulationOptions }
  | { type: "TICK"; delta: number; stageCount: number; duration: number; failsHere: boolean }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SELECT_STAGE"; index: number }
  | { type: "JUMP_STAGE"; index: number }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "REPLAY" }
  | { type: "RESET"; url: string; parsedUrl: UrlInfo };

export interface SimulationOptions {
  networkProfile: NetworkProfileId;
  errorScenario: ErrorScenarioId;
  method: HttpMethod;
  responseStatus: number;
  contentType: string;
  httpVersion: HttpVersion;
  visitMode: VisitMode;
}

export interface NetworkProfile {
  id: NetworkProfileId;
  label: string;
  description: string;
  multiplier: number;
  timing: { dns: number; tcp: number; tls: number; server: number };
}

export interface ErrorScenario {
  id: ErrorScenarioId;
  label: string;
  stage: StageId | null;
  title: string;
  explanation: string;
}

export interface Challenge {
  stage: StageId;
  question: string;
  answers: readonly string[];
  correctIndex: number;
  explanation: string;
}

export interface WaterfallResource {
  name: string;
  type: "document" | "stylesheet" | "script" | "font" | "image" | "data";
  start: number;
  duration: number;
  cached?: boolean;
}

export interface JourneyPreset {
  id: string;
  label: string;
  description: string;
  profile: NetworkProfileId;
  scenario: ErrorScenarioId;
  httpVersion: HttpVersion;
  visitMode: VisitMode;
}
