"use client";

import { motion } from "framer-motion";
import { Braces, ChevronDown, Globe2, Monitor, Network, Server, Waypoints } from "lucide-react";

const layers = [
  { icon: Monitor, label: "Browser", detail: "URL parser · cache · renderer", color: "text-cyan-300 border-cyan-400/30" },
  { icon: Waypoints, label: "DNS", detail: "Resolver · cache · authority", color: "text-blue-300 border-blue-400/30" },
  { icon: Network, label: "Network", detail: "TCP or QUIC · TLS · routing", color: "text-violet-300 border-violet-400/30" },
  { icon: Server, label: "Server", detail: "Routing · application · data", color: "text-amber-300 border-amber-400/30" },
  { icon: Globe2, label: "Response", detail: "Status · headers · representation", color: "text-emerald-300 border-emerald-400/30" },
  { icon: Braces, label: "Browser renderer", detail: "DOM · CSSOM · layout · paint", color: "text-cyan-300 border-cyan-400/30" },
] as const;

export function ArchitectureView({ activeIndex }: { activeIndex: number }) {
  const activeLayer = Math.min(layers.length - 1, Math.floor(activeIndex * layers.length / 8));
  return (
    <section className="min-h-[330px] rounded-lg border border-slate-800/90 bg-[#070d16]/95 p-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div><p className="font-mono text-[10px] tracking-[.15em] text-cyan-400">SYSTEM MAP</p><h2 className="mt-1 text-lg font-semibold">Architecture view</h2></div>
        <span className="rounded border border-slate-700 px-2 py-1 font-mono text-[9px] text-slate-500">SIMPLIFIED REPRESENTATION</span>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          const active = index === activeLayer;
          return (
            <div key={layer.label} className="contents">
              <motion.div animate={{ borderColor: active ? "rgb(34 211 238 / .65)" : "rgb(30 41 59 / .9)", y: active ? -3 : 0 }} className={`relative rounded-md border bg-[#09131f] p-4 ${active ? "shadow-[0_0_28px_rgb(34_211_238/10%)]" : ""}`}>
                <Icon size={19} className={layer.color.split(" ")[0]} />
                <p className="mt-5 font-mono text-xs text-slate-200">{layer.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{layer.detail}</p>
                <span className="absolute right-3 top-3 font-mono text-[9px] text-slate-700">0{index + 1}</span>
              </motion.div>
              {index < layers.length - 1 && <ChevronDown className="mx-auto text-slate-700 sm:hidden" size={15} />}
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 border-t border-slate-800/80 pt-5 md:grid-cols-3">
        <Metric label="BOUNDARY" value="Client ↔ Network ↔ Server" />
        <Metric label="TRANSPORT" value="TCP + TLS (this simulation)" />
        <Metric label="REALITY CHECK" value="Caches and connection reuse may skip work" />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="font-mono text-[9px] tracking-wider text-slate-700">{label}</p><p className="mt-1 text-xs text-slate-400">{value}</p></div>;
}
