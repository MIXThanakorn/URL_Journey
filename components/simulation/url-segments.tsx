import type { UrlInfo } from "@/types/simulation";

const segmentStyles = [
  "border-cyan-400/30 bg-cyan-400/8 text-cyan-300",
  "border-blue-400/30 bg-blue-400/8 text-blue-300",
  "border-violet-400/30 bg-violet-400/8 text-violet-300",
  "border-emerald-400/30 bg-emerald-400/8 text-emerald-300",
  "border-amber-400/30 bg-amber-400/8 text-amber-300",
  "border-rose-400/30 bg-rose-400/8 text-rose-300",
] as const;

export function UrlSegments({ url }: { url: UrlInfo }) {
  const segments = [url.protocol, url.host, url.port, url.path, url.query, url.fragment];
  const labels = ["protocol", "host", "port", "path", "query", "fragment"];

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 font-mono text-[13px]">
      {segments.map((segment, index) => segment ? (
        <button
          key={labels[index]}
          type="button"
          className={`rounded border px-2 py-1.5 transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${segmentStyles[index]}`}
          title={labels[index]}
        >
          <span className="sr-only">{labels[index]}: </span>{segment}
        </button>
      ) : null)}
    </div>
  );
}
