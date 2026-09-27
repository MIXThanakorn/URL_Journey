import { CircleDot, Clock3, Info } from "lucide-react";
import type { SimulationStage, UrlInfo } from "@/types/simulation";

export function Inspector({ stage, url, elapsed }: { stage: SimulationStage; url: UrlInfo; elapsed: number }) {
  const requestPath = `${url.path}${url.query}`;
  return (
    <aside className="overflow-hidden rounded-lg border border-slate-800/90 bg-[#08111c]/95">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3 font-mono text-[10px] tracking-[.16em] text-slate-500">
        <span>STAGE INSPECTOR</span>
        <span className="flex items-center gap-1.5"><Clock3 size={12} /> {(elapsed / 1000).toFixed(1)}s</span>
      </div>
      <div className="p-5">
        <p className="font-mono text-[10px] tracking-[.15em] text-cyan-400/80">{stage.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">{stage.title}</h2>
        <p className="mt-3 text-[15px] leading-6 text-slate-400">{stage.description}</p>

        {(stage.id === "http-request" || stage.id === "http-response") && (
          <pre className="mt-5 overflow-x-auto rounded-md border border-slate-800 bg-[#050a11] p-4 font-mono text-[11px] leading-5 text-slate-300">
            {stage.id === "http-request"
              ? `GET ${requestPath} HTTP/1.1\nHost: ${url.host}\nAccept: text/html\nUser-Agent: URL-Journey`
              : "HTTP/1.1 200 OK\nContent-Type: text/html; charset=utf-8\nContent-Length: 4812\n\n<!doctype html> …"}
          </pre>
        )}

        <div className="mt-6 border-t border-slate-800/80 pt-5">
          <h3 className="flex items-center gap-2 font-mono text-[10px] tracking-[.14em] text-slate-500"><Info size={13} /> TECHNICAL NOTE</h3>
          <p className="mt-3 text-[13px] leading-6 text-slate-500">{stage.technical}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-mono text-[10px] tracking-[.14em] text-slate-500">KEY CONCEPTS</h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            {stage.concepts.map((concept) => (
              <li key={concept} className="flex items-center gap-2 text-xs text-slate-400"><CircleDot size={11} className="shrink-0 text-cyan-500" /> {concept}</li>
            ))}
          </ul>
        </div>

        <p className="mt-6 rounded border border-blue-400/15 bg-blue-400/5 px-3 py-2 font-mono text-[10px] leading-4 text-blue-300/70">SIMULATED • Educational abstraction, not a live packet trace.</p>
      </div>
    </aside>
  );
}
