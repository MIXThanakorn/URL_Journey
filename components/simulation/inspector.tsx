import { CircleDot, Clock3, Info } from "lucide-react";
import type { ErrorScenario, ExplanationMode, HttpMethod, HttpVersion, SimulationStage, UrlInfo } from "@/types/simulation";
import { getExplanation } from "@/data/explanations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InspectorProps {
  stage: SimulationStage;
  url: UrlInfo;
  elapsed: number;
  mode: ExplanationMode;
  method: HttpMethod;
  responseStatus: number;
  contentType: string;
  httpVersion: HttpVersion;
  error?: ErrorScenario;
}

export function Inspector({ stage, url, elapsed, mode, method, responseStatus, contentType, httpVersion, error }: InspectorProps) {
  const requestPath = `${url.path}${url.query}`;
  const statusLabel = responseStatus === 200 ? "OK" : responseStatus === 301 ? "Moved Permanently" : responseStatus === 404 ? "Not Found" : responseStatus === 500 ? "Internal Server Error" : "Simulated";
  const redirectHeader = responseStatus === 301 ? `\nLocation: https://${url.host}${requestPath}` : "";
  const protocolLabel = httpVersion === "http-1.1" ? "HTTP/1.1" : httpVersion === "http-2" ? "HTTP/2" : "HTTP/3";
  return (
    <aside className="overflow-hidden rounded-lg border border-slate-800/90 bg-[#08111c]/95">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3 font-mono text-xs tracking-[.12em] text-slate-500">
        <span>STAGE INSPECTOR</span>
        <span className="flex items-center gap-1.5"><Clock3 size={12} /> {(elapsed / 1000).toFixed(1)}s</span>
      </div>
      <div className="p-5">
        <p className="font-mono text-xs tracking-[.15em] text-cyan-400/80">{stage.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">{stage.title}</h2>
        <Tabs defaultValue="overview" className="mt-4"><TabsList className="w-full bg-[#0d1826]"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="technical">Technical</TabsTrigger><TabsTrigger value="raw">Raw</TabsTrigger></TabsList>
          <TabsContent value="overview" className="pt-4"><p className="text-base leading-7 text-slate-400">{getExplanation(stage.id, mode)}</p>{error && <div className="mt-5 rounded-md border border-rose-400/25 bg-rose-400/7 p-4"><p className="font-mono text-sm font-semibold text-rose-300">{error.title}</p><p className="mt-2 text-sm leading-6 text-rose-100/60">{error.explanation}</p></div>}<h3 className="mt-6 font-mono text-xs tracking-[.14em] text-slate-500">STEP BY STEP</h3><ol className="mt-3 space-y-2">{stageSteps(stage.id).map((step,index)=><li key={step} className="flex gap-3 text-sm leading-6 text-slate-400"><span className="font-mono text-cyan-400">{index+1}</span>{step}</li>)}</ol><h3 className="mt-6 font-mono text-xs tracking-[.14em] text-slate-500">KEY CONCEPTS</h3><ul className="mt-3 grid grid-cols-2 gap-3">{stage.concepts.map((concept)=><li key={concept} className="flex items-center gap-2 text-sm text-slate-400"><CircleDot size={12} className="shrink-0 text-cyan-500" />{concept}</li>)}</ul></TabsContent>
          <TabsContent value="technical" className="pt-4"><h3 className="flex items-center gap-2 font-mono text-xs tracking-[.14em] text-slate-500"><Info size={14} /> TECHNICAL NOTE</h3><p className="mt-3 text-sm leading-7 text-slate-400">{stage.technical}</p>{(stage.id === "http-request" || stage.id === "http-response") && <div className="mt-5 grid grid-cols-2 gap-2"><div className={`rounded border p-3 ${stage.id === "http-request" ? "border-cyan-400/30 bg-cyan-400/5" : "border-slate-800"}`}><p className="font-mono text-xs text-slate-600">REQUEST</p><p className="mt-2 break-all font-mono text-xs text-slate-300">{method} {requestPath}</p></div><div className={`rounded border p-3 ${stage.id === "http-response" ? "border-emerald-400/30 bg-emerald-400/5" : "border-slate-800"}`}><p className="font-mono text-xs text-slate-600">RESPONSE</p><p className="mt-2 font-mono text-xs text-slate-300">{responseStatus} {statusLabel}</p></div></div>}</TabsContent>
          <TabsContent value="raw" className="pt-4"><pre className="overflow-x-auto rounded-md border border-slate-800 bg-[#050a11] p-4 font-mono text-xs leading-6 text-slate-300">{`${method} ${requestPath} ${protocolLabel}\nHost: ${url.host}\nAccept: ${contentType}\nUser-Agent: URL-Journey\n\n${protocolLabel} ${responseStatus} ${statusLabel}${redirectHeader}\nContent-Type: ${contentType}; charset=utf-8\nContent-Length: 4812\n\n<!doctype html> …`}</pre>{httpVersion !== "http-1.1" && <p className="mt-3 text-sm leading-6 text-blue-200/65">Shown as readable text for learning; HTTP/2 and HTTP/3 use binary framing on the wire.</p>}{responseStatus === 301 && <p className="mt-3 text-sm leading-6 text-amber-200/70">The browser follows the Location header and starts a second HTTPS request chain.</p>}</TabsContent>
        </Tabs>
        <p className="mt-6 rounded border border-blue-400/15 bg-blue-400/5 px-3 py-2 font-mono text-xs leading-5 text-blue-300/70">SIMULATED • Educational abstraction, not a live packet trace.</p>
      </div>
    </aside>
  );
}

function stageSteps(id: SimulationStage["id"]): readonly string[] {
  const map: Record<SimulationStage["id"], readonly string[]> = {
    "url-parse": ["Read and normalize the URL.", "Separate scheme, host, port, path, query, and fragment.", "Choose the next network action."],
    dns: ["Check available caches.", "Ask a recursive resolver when needed.", "Receive address data with a cache lifetime."],
    tcp: ["Send SYN.", "Receive SYN-ACK.", "Acknowledge and establish the byte stream."],
    tls: ["Offer supported security parameters.", "Validate the server certificate.", "Derive encrypted traffic keys."],
    "http-request": ["Choose the method and request target.", "Attach request headers.", "Send the request on the selected connection."],
    "http-response": ["Read the status.", "Interpret response headers.", "Stream or decode the representation body."],
    render: ["Parse HTML and CSS.", "Build DOM, CSSOM, and the render tree.", "Calculate layout, paint, and composite pixels."],
    complete: ["Display useful pixels.", "Continue deferred loading or scripts.", "Respond to user interaction."],
  };
  return map[id];
}
