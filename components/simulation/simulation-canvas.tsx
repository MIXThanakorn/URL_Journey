"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, FileCode2, LockKeyhole, Monitor, Server, TriangleAlert, Waypoints } from "lucide-react";
import type { ErrorScenario, HttpMethod, HttpVersion, StageId, UrlInfo, VisitMode } from "@/types/simulation";

interface CanvasProps {
  stage: StageId;
  url: UrlInfo;
  progress: number;
  paused: boolean;
  error?: ErrorScenario;
  method: HttpMethod;
  responseStatus: number;
  httpVersion: HttpVersion;
  visitMode: VisitMode;
}

const nodeStyle = "absolute flex min-w-24 flex-col items-center gap-2 text-center font-mono text-xs text-slate-400";

function Node({ x, y, icon, label, active = false }: { x: string; y: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={nodeStyle} style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
      <div className={`grid h-12 w-12 place-items-center rounded-lg border transition ${active ? "border-cyan-300/70 bg-cyan-400/10 text-cyan-300 shadow-[0_0_28px_rgb(34_211_238/18%)]" : "border-slate-700 bg-[#0b1421] text-slate-500"}`}>
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
}

function Packet({ label, reverse = false, delay = 0 }: { label: string; reverse?: boolean; delay?: number }) {
  return (
    <motion.div
      className="absolute left-[18%] top-1/2 z-10 -translate-y-1/2 rounded border border-cyan-300/50 bg-[#061521] px-2 py-1 font-mono text-xs font-semibold text-cyan-200 shadow-[0_0_18px_rgb(34_211_238/26%)]"
      initial={{ left: reverse ? "74%" : "18%", opacity: 0 }}
      animate={{ left: reverse ? "18%" : "74%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      {label}
    </motion.div>
  );
}

function UrlParseView({ url }: { url: UrlInfo }) {
  const pieces = [
    ["PROTOCOL", url.protocol], ["HOST", url.host], ["PORT", url.port],
    ["PATH", url.path], ["QUERY", url.query || "—"], ["FRAGMENT", url.fragment || "—"],
  ];
  return (
    <div className="grid h-full content-center grid-cols-2 gap-2 px-5 sm:grid-cols-3">
      {pieces.map(([label, value], index) => (
        <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-md border border-slate-800 bg-[#08111d]/90 p-3">
          <p className="font-mono text-xs tracking-[0.12em] text-slate-600">{label}</p>
          <p className="mt-1 truncate font-mono text-xs text-cyan-200">{value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function NetworkView({ stage, secure, method, responseStatus, httpVersion, visitMode }: { stage: StageId; secure: boolean; method: HttpMethod; responseStatus: number; httpVersion: HttpVersion; visitMode: VisitMode }) {
  const isDns = stage === "dns";
  const isTcp = stage === "tcp";
  const isTls = stage === "tls";
  const isRequest = stage === "http-request";
  const isResponse = stage === "http-response";
  const quic = httpVersion === "http-3";
  const label = isDns ? (visitMode === "repeat" ? "CACHE HIT" : "DNS QUERY") : isTcp ? (quic ? "QUIC INITIAL" : "SYN") : isTls ? (quic ? "TLS IN QUIC" : "CLIENT HELLO") : isRequest ? `${method} /` : `${responseStatus}`;
  const reverse = isResponse;

  if (isTls && !secure) {
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-amber-400/30 bg-amber-400/8 text-amber-300"><LockKeyhole size={24} /></div>
          <p className="mt-4 font-mono text-sm text-amber-200">TLS SKIPPED</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">This URL uses HTTP, so no TLS handshake is simulated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-64">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <line x1="22%" y1="50%" x2="78%" y2="50%" stroke="#1e3850" strokeWidth="2" strokeDasharray="6 7" />
        <line x1="22%" y1="50%" x2="78%" y2="50%" stroke="#22d3ee" strokeWidth="1" strokeOpacity=".25" />
      </svg>
      <Node x="18%" y="50%" icon={<Monitor size={22} />} label="BROWSER" active />
      <Node x="82%" y="50%" icon={isDns ? <Waypoints size={22} /> : <Server size={22} />} label={isDns ? "DNS RESOLVER" : urlLabel(stage)} active />
      <Packet label={label} reverse={reverse} />
      {(isTcp || isTls) && <Packet label={isTcp ? (quic ? "QUIC HANDSHAKE" : "SYN-ACK") : (quic ? "ENCRYPTED KEYS" : "SERVER HELLO")} reverse delay={0.65} />}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-slate-800 bg-[#07101b] px-3 py-1 font-mono text-xs text-slate-500">
        {isDns ? `SIMULATED • ${visitMode === "repeat" ? "DNS CACHE REUSED" : "93.184.216.34 • TTL 3600"}` : quic ? "HTTP/3 • QUIC + TLS 1.3" : isTls ? "SIMPLIFIED REPRESENTATION" : "SIMULATED NETWORK FLOW"}
      </div>
    </div>
  );
}

function urlLabel(stage: StageId): string {
  return stage === "tls" ? "SECURE SERVER" : "WEB SERVER";
}

function RenderView({ complete = false }: { complete?: boolean }) {
  const steps = ["HTML", "DOM + CSSOM", "RENDER TREE", "LAYOUT", "PAINT"];
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center px-5">
      {complete ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_40px_rgb(52_211_153/16%)]"><Check size={30} /></div>
          <p className="mt-5 font-mono text-lg font-semibold tracking-wide text-emerald-200">PAGE RENDERED</p>
          <p className="mt-2 text-sm text-slate-500">The simulated journey reached the screen.</p>
        </motion.div>
      ) : (
        <div className="grid w-full max-w-3xl gap-5 px-2 md:grid-cols-[1fr_180px]">
          <div>
            <div className="flex items-center justify-between gap-1">
              {steps.map((step, index) => (
                <div key={step} className="contents">
                  <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * .13 }} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-md border border-cyan-400/25 bg-cyan-400/8 text-cyan-300"><FileCode2 size={15} /></div>
                    <span className="text-center font-mono text-[8px] text-slate-500">{step}</span>
                  </motion.div>
                  {index < steps.length - 1 && <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: index * .13 + .12 }} className="h-px w-2 origin-left bg-cyan-400/40 sm:w-5" />}
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 font-mono text-xs text-slate-600">
              <div className="rounded border border-slate-800 bg-[#050a11] p-3"><span className="text-blue-300">html</span><br />├─ head<br />└─ body<br />&nbsp;&nbsp;├─ header<br />&nbsp;&nbsp;└─ main</div>
              <div className="rounded border border-slate-800 bg-[#050a11] p-3"><span className="text-violet-300">cssom</span><br />├─ body<br />│&nbsp;&nbsp;└─ display:block<br />└─ main<br />&nbsp;&nbsp;└─ color:…</div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6 }} className="rounded border border-slate-700 bg-[#0b1623] p-2 shadow-[0_0_30px_rgb(34_211_238/8%)]">
            <div className="flex gap-1 border-b border-slate-700 pb-2"><span className="h-1.5 w-1.5 rounded-full bg-rose-400/70" /><span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" /><span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" /></div>
            <div className="mt-2 h-5 rounded bg-cyan-400/12" /><div className="mt-2 h-2 w-2/3 rounded bg-slate-600/50" /><div className="mt-2 h-16 rounded border border-slate-700 bg-blue-400/5" />
          </motion.div>
        </div>
      )}
    </div>
  );
}

export function SimulationCanvas({ stage, url, progress, paused, error, method, responseStatus, httpVersion, visitMode }: CanvasProps) {
  const networkStages: readonly StageId[] = ["dns", "tcp", "tls", "http-request", "http-response"];
  return (
    <section className="relative min-h-[330px] overflow-hidden rounded-lg border border-slate-800/90 bg-[#070d16]/95 shadow-[inset_0_1px_rgb(255_255_255/2%)]">
      <div className="absolute inset-x-0 top-0 z-20 flex h-10 items-center justify-between border-b border-slate-800/80 bg-[#09121e]/90 px-4 font-mono text-xs tracking-wider text-slate-500">
        <span className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${paused ? "bg-amber-400" : "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"}`} /> LIVE SIMULATION</span>
        <span>{Math.round(progress).toString().padStart(3, "0")}%</span>
      </div>
      <div className="absolute inset-x-0 top-10 h-px bg-cyan-300/10" />
      <div className="absolute left-0 top-0 h-full w-px bg-cyan-300/10" />
      <div className="h-full min-h-[330px] pt-10">
        <AnimatePresence mode="wait">
          <motion.div key={stage} className="h-full min-h-[290px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
            {error ? (
              <div className="grid h-full min-h-[290px] place-items-center px-8 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-rose-400/30 bg-rose-400/8 text-rose-300"><TriangleAlert size={24} /></div><p className="mt-4 font-mono text-sm text-rose-200">{error.title.toUpperCase()}</p><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{error.explanation}</p></div></div>
            ) : (
              <>
                {stage === "url-parse" && <UrlParseView url={url} />}
                {networkStages.includes(stage) && <NetworkView stage={stage} secure={url.secure} method={method} responseStatus={responseStatus} httpVersion={httpVersion} visitMode={visitMode} />}
                {stage === "render" && <RenderView />}
                {stage === "complete" && <RenderView complete />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
