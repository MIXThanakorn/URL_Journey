import type { NetworkProfile, NetworkProfileId, StageId } from "@/types/simulation";

export const networkProfiles: readonly NetworkProfile[] = [
  { id: "fast", label: "Fast", description: "Low-latency wired connection", multiplier: 0.7, timing: { dns: 20, tcp: 15, tls: 30, server: 45 } },
  { id: "4g", label: "4G", description: "Typical mobile connection", multiplier: 1, timing: { dns: 55, tcp: 45, tls: 90, server: 110 } },
  { id: "slow-4g", label: "Slow 4G", description: "Congested mobile connection", multiplier: 1.65, timing: { dns: 180, tcp: 120, tls: 300, server: 420 } },
  { id: "3g", label: "3G", description: "High-latency mobile connection", multiplier: 2.35, timing: { dns: 320, tcp: 240, tls: 520, server: 680 } },
  { id: "offline", label: "Offline", description: "No network connectivity", multiplier: 0.55, timing: { dns: 0, tcp: 0, tls: 0, server: 0 } },
  { id: "custom", label: "Custom", description: "User-defined latency profile", multiplier: 1.35, timing: { dns: 120, tcp: 90, tls: 180, server: 260 } },
] as const;

export function getNetworkProfile(id: NetworkProfileId): NetworkProfile {
  return networkProfiles.find((profile) => profile.id === id) ?? networkProfiles[1];
}

export function getTimingForStage(profile: NetworkProfile, stage: StageId): number | null {
  if (stage === "dns") return profile.timing.dns;
  if (stage === "tcp") return profile.timing.tcp;
  if (stage === "tls") return profile.timing.tls;
  if (stage === "http-response") return profile.timing.server;
  return null;
}
