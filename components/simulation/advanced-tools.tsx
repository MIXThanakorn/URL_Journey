"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileJson, Gauge, GitCompareArrows, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { glossary } from "@/data/glossary";
import { journeyPresets } from "@/data/presets";
import { getNetworkProfile } from "@/simulation/network";
import type { HttpVersion, JourneyPreset, NetworkProfileId, VisitMode, WaterfallResource } from "@/types/simulation";

interface AdvancedToolsProps {
  elapsed: number;
  profile: NetworkProfileId;
  visitMode: VisitMode;
  httpVersion: HttpVersion;
  url: string;
  onPreset: (preset: JourneyPreset) => void;
}

const baseResources: readonly WaterfallResource[] = [
  { name: "document", type: "document", start: 0, duration: 360 },
  { name: "styles.css", type: "stylesheet", start: 330, duration: 210 },
  { name: "app.js", type: "script", start: 350, duration: 420 },
  { name: "font.woff2", type: "font", start: 530, duration: 260 },
  { name: "hero.webp", type: "image", start: 550, duration: 520 },
  { name: "api/data", type: "data", start: 790, duration: 300 },
];

export function AdvancedTools(props: AdvancedToolsProps) {
  const [harResources, setHarResources] = useState<WaterfallResource[]>([]);
  const [harMessage, setHarMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const multiplier = getNetworkProfile(props.profile).multiplier * (props.visitMode === "repeat" ? 0.42 : 1);
  const resources = useMemo(() => (harResources.length ? harResources : baseResources.map((resource, index) => ({ ...resource, start: resource.start * multiplier, duration: resource.duration * multiplier * (props.httpVersion === "http-1.1" ? 1.18 : props.httpVersion === "http-3" ? .82 : 1), cached: props.visitMode === "repeat" && index > 0 }))), [harResources, multiplier, props.httpVersion, props.visitMode]);
  const total = Math.max(...resources.map((resource) => resource.start + resource.duration), 1);

  const importHar = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (typeof parsed !== "object" || parsed === null || !("log" in parsed) || typeof parsed.log !== "object" || parsed.log === null || !("entries" in parsed.log) || !Array.isArray(parsed.log.entries)) throw new Error("Invalid HAR");
      const entries = parsed.log.entries.slice(0, 20);
      const converted: WaterfallResource[] = entries.flatMap((entry: unknown, index: number) => {
        if (typeof entry !== "object" || entry === null || !("request" in entry) || typeof entry.request !== "object" || entry.request === null || !("url" in entry.request) || typeof entry.request.url !== "string") return [];
        const duration = "time" in entry && typeof entry.time === "number" ? Math.max(10, entry.time) : 100;
        let name = entry.request.url;
        try { name = new URL(entry.request.url).pathname.split("/").pop() || "document"; } catch { name = `resource-${index + 1}`; }
        return [{ name, type: index === 0 ? "document" : "data", start: index * 45, duration } satisfies WaterfallResource];
      });
      if (!converted.length) throw new Error("No requests");
      setHarResources(converted); setHarMessage(`${converted.length} HAR entries loaded locally.`);
    } catch { setHarMessage("This file is not a readable HAR export."); }
  };

  const download = (filename: string, contents: string, type: string) => {
    const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([contents], { type })); anchor.download = filename; anchor.click(); URL.revokeObjectURL(anchor.href);
  };

  const exportJson = () => download("url-journey.json", JSON.stringify({ url: props.url, profile: props.profile, visitMode: props.visitMode, httpVersion: props.httpVersion, elapsed: props.elapsed, resources }, null, 2), "application/json");
  const exportSvg = () => download("url-journey.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#05080f"/><text x="70" y="90" fill="#67e8f9" font-family="monospace" font-size="34">URL JOURNEY</text><text x="70" y="140" fill="#94a3b8" font-family="sans-serif" font-size="20">${escapeXml(props.url)}</text>${resources.map((r,i)=>`<text x="70" y="${210+i*48}" fill="#cbd5e1" font-family="monospace" font-size="16">${escapeXml(r.name)}</text><rect x="350" y="${192+i*48}" width="${Math.max(8,r.duration/total*760)}" height="24" rx="4" fill="#22d3ee" opacity=".65"/>`).join("")}</svg>`, "image/svg+xml");

  return (
    <section className="mt-4 rounded-lg border border-slate-800/90 bg-[#07101a]/95 p-4 sm:p-5">
      <Tabs defaultValue="waterfall"><TabsList className="w-full justify-start overflow-x-auto bg-[#0d1826]"><TabsTrigger value="waterfall">Waterfall</TabsTrigger><TabsTrigger value="summary">Summary</TabsTrigger><TabsTrigger value="compare">Compare</TabsTrigger><TabsTrigger value="presets">Presets</TabsTrigger><TabsTrigger value="glossary">Glossary</TabsTrigger></TabsList>
        <TabsContent value="waterfall" className="pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-semibold">Simulated resource waterfall</h2><p className="mt-1 text-sm text-slate-500">Resources overlap to show parallel loading and cache reuse.</p></div><div className="flex gap-2"><input ref={fileRef} type="file" accept=".har,application/json" className="hidden" onChange={(event) => { const file=event.target.files?.[0]; if(file) void importHar(file); }} /><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload /> Import HAR</Button>{harResources.length > 0 && <Button variant="ghost" size="sm" onClick={() => {setHarResources([]);setHarMessage("");}}><RotateCcw /> Reset</Button>}</div></div>{harMessage && <p className="mt-3 text-sm text-cyan-300">{harMessage}</p>}<div className="mt-5 space-y-2">{resources.map((resource)=><div key={`${resource.name}-${resource.start}`} className="grid grid-cols-[110px_1fr_58px] items-center gap-3 text-sm"><span className="truncate font-mono text-xs text-slate-400">{resource.name}</span><div className="relative h-6 rounded bg-slate-900"><div className={`absolute top-1 h-4 rounded ${resource.cached ? "bg-emerald-400/45" : "bg-cyan-400/55"}`} style={{left:`${resource.start/total*100}%`,width:`${Math.max(2,resource.duration/total*100)}%`}} /></div><span className="text-right font-mono text-xs text-slate-500">{resource.cached ? "cache" : `${Math.round(resource.duration)}ms`}</span></div>)}</div></TabsContent>
        <TabsContent value="summary" className="pt-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Summary label="Total simulated" value={`${(props.elapsed/1000).toFixed(1)}s`} /><Summary label="DNS" value={`${Math.round(55*multiplier)}ms`} /><Summary label="Transport" value={props.httpVersion === "http-3" ? "QUIC" : `${Math.round(135*multiplier)}ms`} /><Summary label="Server" value={`${Math.round(110*multiplier)}ms`} /><Summary label="Rendering" value={`${Math.round(540*multiplier)}ms`} /></div><p className="mt-5 rounded border border-slate-800 bg-slate-900/40 p-4 text-sm leading-6 text-slate-400"><Gauge className="mr-2 inline text-cyan-300" size={17} />The slowest conceptual area is highlighted by the selected network profile. A repeat visit can reuse DNS, connections, and cached resources, but real outcomes depend on cache policy and browser state.</p></TabsContent>
        <TabsContent value="compare" className="pt-5"><div className="grid gap-4 md:grid-cols-2"><Compare title="First visit" profile={props.profile} factor={getNetworkProfile(props.profile).multiplier} notes="DNS + connection + full resource transfer" /><Compare title="Repeat visit" profile={props.profile} factor={getNetworkProfile(props.profile).multiplier*.42} notes="Connection and cache reuse where permitted" /></div><div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><GitCompareArrows className="text-cyan-300" /> Repeat visits are usually faster, but validation and updated resources can still require network work.</div></TabsContent>
        <TabsContent value="presets" className="pt-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{journeyPresets.map((preset)=><button key={preset.id} type="button" onClick={()=>props.onPreset(preset)} className="rounded-md border border-slate-800 bg-slate-900/35 p-4 text-left transition hover:border-cyan-400/35 hover:bg-cyan-400/5"><p className="text-sm font-medium text-slate-200">{preset.label}</p><p className="mt-2 text-sm leading-5 text-slate-500">{preset.description}</p></button>)}</div></TabsContent>
        <TabsContent value="glossary" className="pt-5"><div className="grid gap-3 md:grid-cols-2">{glossary.map(([term,definition])=><div key={term} className="rounded border border-slate-800 p-4"><dt className="font-mono text-sm text-cyan-200">{term}</dt><dd className="mt-2 text-sm leading-6 text-slate-500">{definition}</dd></div>)}</div></TabsContent>
      </Tabs>
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-800 pt-4"><Button variant="outline" size="sm" onClick={exportJson}><FileJson /> Export JSON</Button><Button variant="outline" size="sm" onClick={exportSvg}><Download /> Export SVG</Button></div>
    </section>
  );
}

function Summary({label,value}:{label:string;value:string}){return <div className="rounded border border-slate-800 bg-slate-900/35 p-4"><p className="text-xs text-slate-600">{label}</p><p className="mt-2 font-mono text-lg text-slate-200">{value}</p></div>}
function Compare({title,profile,factor,notes}:{title:string;profile:NetworkProfileId;factor:number;notes:string}){return <div className="rounded-md border border-slate-800 p-5"><p className="font-medium text-slate-200">{title}</p><p className="mt-1 text-xs uppercase tracking-wider text-cyan-400">{getNetworkProfile(profile).label} · ×{factor.toFixed(2)}</p><div className="mt-4 h-2 rounded bg-slate-900"><div className="h-full rounded bg-cyan-400/60" style={{width:`${Math.min(100,factor/2.35*100)}%`}} /></div><p className="mt-3 text-sm text-slate-500">{notes}</p></div>}
function escapeXml(value:string){return value.replace(/[<>&'"]/g,(char)=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[char] ?? char));}
