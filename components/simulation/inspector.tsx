import { CircleDot, Clock3, Info } from "lucide-react";
import type { ErrorScenario, ExplanationMode, HttpMethod, SimulationStage, UrlInfo } from "@/types/simulation";
import { getExplanation } from "@/data/explanations";

interface InspectorProps {
  stage: SimulationStage;
  url: UrlInfo;
  elapsed: number;
  mode: ExplanationMode;
  method: HttpMethod;
  responseStatus: number;
  contentType: string;
  error?: ErrorScenario;
}

export function Inspector({ stage, url, elapsed, mode, method, responseStatus, contentType, error }: InspectorProps) {
  const requestPath = `${url.path}${url.query}`;
  const statusLabel = responseStatus === 200 ? "OK" : responseStatus === 404 ? "Not Found" : responseStatus === 500 ? "Internal Server Error" : "Simulated";
  return (
    <aside className="overflow-hidden rounded-lg border border-slate-800/90 bg-[#08111c]/95">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3 font-mono text-[10px] tracking-[.16em] text-slate-500">
        <span>STAGE INSPECTOR</span>
        <span className="flex items-center gap-1.5"><Clock3 size={12} /> {(elapsed / 1000).toFixed(1)}s</span>
      </div>
      <div className="p-5">
        <p className="font-mono text-[10px] tracking-[.15em] text-cyan-400/80">{stage.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">{stage.title}</h2>
        <p className="mt-3 text-[15px] leading-6 text-slate-400">{getExplanation(stage.id, mode)}</p>

        {error && (
          <div className="mt-5 rounded-md border border-rose-400/25 bg-rose-400/7 p-4">
            <p className="font-mono text-xs font-semibold text-rose-300">{error.title}</p>
            <p className="mt-2 text-sm leading-6 text-rose-100/60">{error.explanation}</p>
          </div>
        )}

        {(stage.id === "http-request" || stage.id === "http-response") && (
          <pre className="mt-5 overflow-x-auto rounded-md border border-slate-800 bg-[#050a11] p-4 font-mono text-[11px] leading-5 text-slate-300">
            {stage.id === "http-request"
              ? `${method} ${requestPath} HTTP/1.1\nHost: ${url.host}\nAccept: ${contentType}\nUser-Agent: URL-Journey`
              : `HTTP/1.1 ${responseStatus} ${statusLabel}\nContent-Type: ${contentType}; charset=utf-8\nContent-Length: 4812\n\n<!doctype html> …`}
          </pre>
        )}

        {(stage.id === "http-request" || stage.id === "http-response") && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className={`rounded border p-3 ${stage.id === "http-request" ? "border-cyan-400/30 bg-cyan-400/5" : "border-slate-800 bg-[#060c14]"}`}><p className="font-mono text-[9px] text-slate-600">REQUEST</p><p className="mt-2 font-mono text-xs text-slate-300">{method} {requestPath}</p></div>
            <div className={`rounded border p-3 ${stage.id === "http-response" ? "border-emerald-400/30 bg-emerald-400/5" : "border-slate-800 bg-[#060c14]"}`}><p className="font-mono text-[9px] text-slate-600">RESPONSE</p><p className="mt-2 font-mono text-xs text-slate-300">{responseStatus} {statusLabel}</p></div>
          </div>
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
