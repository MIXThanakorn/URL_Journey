import type { UrlInfo } from "@/types/simulation";

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export function parseUrl(value: string): UrlInfo | null {
  try {
    const parsed = new URL(normalizeUrl(value));
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const secure = parsed.protocol === "https:";
    return {
      protocol: `${parsed.protocol}//`,
      host: parsed.hostname,
      port: parsed.port ? `:${parsed.port}` : secure ? ":443" : ":80",
      path: parsed.pathname || "/",
      query: parsed.search,
      fragment: parsed.hash,
      secure,
    };
  } catch {
    return null;
  }
}
