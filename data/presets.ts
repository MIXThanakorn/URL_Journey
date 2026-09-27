import type { JourneyPreset } from "@/types/simulation";

export const journeyPresets: readonly JourneyPreset[] = [
  { id: "normal", label: "Normal HTTPS", description: "A first visit over HTTP/2 and 4G", profile: "4g", scenario: "none", httpVersion: "http-2", visitMode: "first" },
  { id: "slow", label: "First visit on 3G", description: "See latency compound across the journey", profile: "3g", scenario: "none", httpVersion: "http-1.1", visitMode: "first" },
  { id: "cached", label: "Cached repeat visit", description: "Reuse DNS, connection, and cached resources", profile: "fast", scenario: "none", httpVersion: "http-2", visitMode: "repeat" },
  { id: "dns", label: "DNS failure", description: "Stop before a server connection exists", profile: "4g", scenario: "dns-failure", httpVersion: "http-2", visitMode: "first" },
  { id: "redirect", label: "Redirect to HTTPS", description: "Follow a conceptual HTTP to HTTPS redirect", profile: "4g", scenario: "redirect", httpVersion: "http-2", visitMode: "first" },
  { id: "h3", label: "HTTP/3 over QUIC", description: "Compare QUIC with the TCP-based teaching path", profile: "4g", scenario: "none", httpVersion: "http-3", visitMode: "first" },
] as const;
