import type { ErrorScenario, ErrorScenarioId, StageId } from "@/types/simulation";

export const errorScenarios: readonly ErrorScenario[] = [
  { id: "none", label: "No failure", stage: null, title: "Normal journey", explanation: "Every simulated stage can complete." },
  { id: "dns-failure", label: "DNS failure", stage: "dns", title: "DNS resolution failed", explanation: "The resolver could not translate the hostname into an IP address." },
  { id: "connection-timeout", label: "Connection timeout", stage: "tcp", title: "Connection timed out", explanation: "The client did not receive the expected response while opening the connection." },
  { id: "tls-error", label: "TLS error", stage: "tls", title: "Secure connection failed", explanation: "Certificate validation or secure key establishment did not complete." },
  { id: "404", label: "404 Not Found", stage: "http-response", title: "404 — Resource not found", explanation: "The server responded, but it could not find a resource for this request target." },
  { id: "500", label: "500 Server Error", stage: "http-response", title: "500 — Server error", explanation: "The server encountered an unexpected condition while handling the request." },
  { id: "slow-server", label: "Slow server", stage: null, title: "Slow server processing", explanation: "The server response stage takes longer than the selected network profile alone would suggest." },
] as const;

export function getErrorScenario(id: ErrorScenarioId): ErrorScenario {
  return errorScenarios.find((scenario) => scenario.id === id) ?? errorScenarios[0];
}

export function failureStageFor(profileId: string, scenarioId: ErrorScenarioId): StageId | null {
  if (profileId === "offline") return "dns";
  return getErrorScenario(scenarioId).stage;
}
