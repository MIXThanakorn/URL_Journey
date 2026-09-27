"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Check, Copy, Languages, Maximize2, Minimize2, Pause, Play, Radar, RefreshCcw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchitectureView } from "@/components/simulation/architecture-view";
import { ChallengePanel } from "@/components/simulation/challenge-panel";
import { AdvancedTools } from "@/components/simulation/advanced-tools";
import { Inspector } from "@/components/simulation/inspector";
import { SettingsPanel } from "@/components/simulation/settings-panel";
import { JourneyControls } from "@/components/simulation/journey-controls";
import { Onboarding } from "@/components/simulation/onboarding";
import { SimulationCanvas } from "@/components/simulation/simulation-canvas";
import { StageTimeline } from "@/components/simulation/stage-timeline";
import { UrlSegments } from "@/components/simulation/url-segments";
import { DEFAULT_OPTIONS, DEFAULT_URL, createInitialState, simulationReducer } from "@/simulation/engine";
import { getNetworkProfile, getTimingForStage } from "@/simulation/network";
import { failureStageFor, getErrorScenario } from "@/simulation/scenarios";
import { getStageDuration, stages } from "@/simulation/stages";
import { normalizeUrl, parseUrl } from "@/lib/url-parser";
import type { AppLocale, ErrorScenario, ErrorScenarioId, ExplanationMode, HttpMethod, HttpVersion, JourneyPreset, NetworkProfileId, ViewMode, VisitMode } from "@/types/simulation";

const initialParsedUrl = parseUrl(DEFAULT_URL)!;

const statusColors = {
  ready: "text-slate-400 border-slate-700 bg-slate-800/30",
  running: "text-cyan-300 border-cyan-400/30 bg-cyan-400/8",
  paused: "text-amber-300 border-amber-400/30 bg-amber-400/8",
  completed: "text-emerald-300 border-emerald-400/30 bg-emerald-400/8",
  error: "text-rose-300 border-rose-400/30 bg-rose-400/8",
} as const;

const profileIds: readonly NetworkProfileId[] = ["fast", "4g", "slow-4g", "3g", "offline", "custom"];
const scenarioIds: readonly ErrorScenarioId[] = ["none", "dns-failure", "connection-timeout", "tls-error", "404", "500", "slow-server", "cors-error", "redirect"];
const modeIds: readonly ExplanationMode[] = ["beginner", "developer", "deep-dive"];
const viewIds: readonly ViewMode[] = ["simulation", "architecture", "challenge"];
const methodIds: readonly HttpMethod[] = ["GET", "HEAD", "POST"];
const httpVersionIds: readonly HttpVersion[] = ["http-1.1", "http-2", "http-3"];
const visitModeIds: readonly VisitMode[] = ["first", "repeat"];

const uiCopy = {
  en: { subtitle: "See what happens after you press Enter.", run: "RUN", reset: "RESET", simulation: "Simulation", architecture: "Architecture", challenge: "Challenge", simulated: "SIMULATED REQUEST — NO EXTERNAL FETCH" },
  th: { subtitle: "ดูว่าเกิดอะไรขึ้นหลังจากกด Enter", run: "เริ่มจำลอง", reset: "รีเซ็ต", simulation: "การจำลอง", architecture: "สถาปัตยกรรม", challenge: "แบบทดสอบ", simulated: "ข้อมูลจำลอง — ไม่มีการเรียกเว็บไซต์ภายนอก" },
} as const;

function isOneOf<T extends string>(value: string | null, options: readonly T[]): value is T {
  return value !== null && options.includes(value as T);
}

export default function Home() {
  const [input, setInput] = useState(DEFAULT_URL);
  const [validationError, setValidationError] = useState("");
  const [profile, setProfile] = useState<NetworkProfileId>("4g");
  const [scenario, setScenario] = useState<ErrorScenarioId>("none");
  const [mode, setMode] = useState<ExplanationMode>("developer");
  const [view, setView] = useState<ViewMode>("simulation");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [responseStatus, setResponseStatus] = useState(200);
  const [contentType, setContentType] = useState("text/html");
  const [customLatency, setCustomLatency] = useState(1.4);
  const [httpVersion, setHttpVersion] = useState<HttpVersion>("http-2");
  const [visitMode, setVisitMode] = useState<VisitMode>("first");
  const [speed, setSpeed] = useState(1);
  const [locale, setLocale] = useState<AppLocale>("en");
  const [presentation, setPresentation] = useState(false);
  const [shareFallback, setShareFallback] = useState("");
  const [copied, setCopied] = useState(false);
  const [state, dispatch] = useReducer(simulationReducer, createInitialState(DEFAULT_URL, initialParsedUrl));

  const selectedStage = stages[state.selectedIndex];
  const activeStage = stages[state.activeIndex];
  const previewUrl = useMemo(() => parseUrl(input), [input]);
  const activeProfile = getNetworkProfile(state.networkProfile);
  const currentTiming = getTimingForStage(activeProfile, activeStage.id);
  const effectiveStatus = scenario === "404" ? 404 : scenario === "500" ? 500 : scenario === "redirect" ? 301 : Math.min(599, Math.max(100, responseStatus || 200));
  const text = uiCopy[locale];

  const run = useCallback(() => {
    const parsed = parseUrl(input);
    if (!parsed) {
      setValidationError("Enter a valid HTTP or HTTPS URL.");
      return;
    }
    setValidationError("");
    const normalized = normalizeUrl(input);
    setInput(normalized);
    dispatch({ type: "START", url: normalized, parsedUrl: parsed, options: { networkProfile: profile, errorScenario: scenario, method, responseStatus: effectiveStatus, contentType: contentType || "text/html", httpVersion, visitMode } });
  }, [contentType, effectiveStatus, httpVersion, input, method, profile, scenario, visitMode]);

  const reset = useCallback(() => {
    setInput(DEFAULT_URL);
    setValidationError("");
    dispatch({ type: "RESET", url: DEFAULT_URL, parsedUrl: initialParsedUrl });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get("u");
    const sharedProfile = params.get("profile");
    const sharedScenario = params.get("error");
    const sharedMode = params.get("mode");
    const sharedView = params.get("view");
    const sharedMethod = params.get("method");
    const sharedHttpVersion = params.get("http");
    const sharedVisit = params.get("visit");
    if (sharedUrl && parseUrl(sharedUrl)) setInput(sharedUrl);
    if (isOneOf(sharedProfile, profileIds)) setProfile(sharedProfile);
    if (isOneOf(sharedScenario, scenarioIds)) setScenario(sharedScenario);
    if (isOneOf(sharedMode, modeIds)) setMode(sharedMode);
    if (isOneOf(sharedView, viewIds)) setView(sharedView);
    if (isOneOf(sharedMethod, methodIds)) setMethod(sharedMethod);
    if (isOneOf(sharedHttpVersion, httpVersionIds)) setHttpVersion(sharedHttpVersion);
    if (isOneOf(sharedVisit, visitModeIds)) setVisitMode(sharedVisit);
    const sharedStatus = Number(params.get("status"));
    if (sharedStatus >= 100 && sharedStatus <= 599) setResponseStatus(sharedStatus);
    const sharedType = params.get("type");
    if (sharedType) setContentType(sharedType);
    const sharedLatency = Number(params.get("latency"));
    if (sharedLatency >= 0.5 && sharedLatency <= 4) setCustomLatency(sharedLatency);
  }, []);

  useEffect(() => {
    if (state.status !== "running") return;
    const profileMultiplier = state.networkProfile === "custom" ? customLatency : getNetworkProfile(state.networkProfile).multiplier;
    const slowServerMultiplier = state.errorScenario === "slow-server" && activeStage.id === "http-response" ? 2.4 : 1;
    const visitMultiplier = state.visitMode === "repeat" ? .55 : 1;
    const protocolMultiplier = state.httpVersion === "http-3" && (activeStage.id === "tcp" || activeStage.id === "tls") ? .35 : 1;
    const duration = getStageDuration(activeStage, state.parsedUrl) * profileMultiplier * slowServerMultiplier * visitMultiplier * protocolMultiplier / speed;
    const failsHere = failureStageFor(state.networkProfile, state.errorScenario) === activeStage.id;
    const interval = window.setInterval(() => {
      dispatch({ type: "TICK", delta: 50, stageCount: stages.length, duration, failsHere });
    }, 50);
    return () => window.clearInterval(interval);
  }, [activeStage, customLatency, speed, state.errorScenario, state.httpVersion, state.networkProfile, state.parsedUrl, state.status, state.visitMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.getAttribute("role") === "combobox") return;
      if (event.code === "Space") { event.preventDefault(); dispatch({ type: "TOGGLE_PAUSE" }); }
      if (event.key.toLowerCase() === "r") dispatch({ type: "REPLAY" });
      if (event.key === "Escape") reset();
      if (event.key === "ArrowLeft") dispatch({ type: "SELECT_STAGE", index: Math.max(0, state.selectedIndex - 1) });
      if (event.key === "ArrowRight") dispatch({ type: "SELECT_STAGE", index: Math.min(stages.length - 1, state.selectedIndex + 1) });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset, state.selectedIndex]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const registration = context.registerTool({
      name: "start_url_journey",
      title: "Start URL Journey",
      description: "Start the educational browser and network simulation for an HTTP or HTTPS URL.",
      inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(value: unknown) {
        if (typeof value !== "object" || value === null || !("url" in value) || typeof value.url !== "string") throw new Error("A URL string is required.");
        const parsed = parseUrl(value.url);
        if (!parsed) throw new Error("Enter a valid HTTP or HTTPS URL.");
        const normalized = normalizeUrl(value.url);
        setInput(normalized);
        dispatch({ type: "START", url: normalized, parsedUrl: parsed, options: DEFAULT_OPTIONS });
        return { status: "running", url: normalized, stage: "url-parse" };
      },
    }, { signal: lifecycle.signal });
    void Promise.resolve(registration).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const share = async () => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("u", normalizeUrl(input));
    url.searchParams.set("profile", profile);
    url.searchParams.set("error", scenario);
    url.searchParams.set("mode", mode);
    url.searchParams.set("view", view);
    url.searchParams.set("method", method);
    url.searchParams.set("status", String(responseStatus));
    url.searchParams.set("type", contentType);
    url.searchParams.set("http", httpVersion);
    url.searchParams.set("visit", visitMode);
    if (profile === "custom") url.searchParams.set("latency", String(customLatency));
    window.history.replaceState(null, "", url);
    try { await navigator.clipboard.writeText(url.toString()); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setShareFallback(url.toString()); }
  };

  const applyPreset = (preset: JourneyPreset) => { setProfile(preset.profile); setScenario(preset.scenario); setHttpVersion(preset.httpVersion); setVisitMode(preset.visitMode); };
  const clearFailureAndRun = () => {
    const parsed = parseUrl(input);
    if (!parsed) return;
    const normalized = normalizeUrl(input);
    setScenario("none");
    dispatch({ type: "START", url: normalized, parsedUrl: parsed, options: { networkProfile: profile, errorScenario: "none", method, responseStatus, contentType, httpVersion, visitMode } });
  };

  const displayStatus = validationError ? "error" : state.status;
  const parsedForPreview = previewUrl ?? state.parsedUrl;
  let activeError: ErrorScenario | undefined;
  if (state.status === "error") {
    activeError = state.networkProfile === "offline"
      ? { id: "dns-failure", label: "Offline", stage: "dns", title: "No network connection", explanation: "The browser is offline, so the hostname cannot be resolved and no connection can begin." }
      : getErrorScenario(state.errorScenario);
  }

  return (
    <main className={`relative min-h-screen overflow-hidden ${presentation ? "bg-[#03060b]" : ""}`}>
      <Onboarding />
      <div aria-hidden="true" className="scan-line pointer-events-none fixed inset-x-0 top-0 z-50 h-px bg-cyan-300/5" />
      <header className={`border-b border-slate-800/80 bg-[#050912]/90 backdrop-blur ${presentation ? "hidden" : ""}`}>
        <div className="mx-auto flex h-[72px] max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center rounded-md border border-cyan-400/30 bg-cyan-400/8 text-cyan-300"><Radar size={20} /><span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#050912]" /></div>
            <div><h1 className="font-mono text-sm font-semibold tracking-[0.08em] text-slate-100">URL JOURNEY</h1><p className="mt-0.5 hidden text-sm text-slate-600 sm:block">{text.subtitle}</p></div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className={`hidden items-center gap-2 rounded border px-2.5 py-1.5 font-mono text-xs tracking-wider sm:flex ${statusColors[displayStatus]}`}><span className={`h-1.5 w-1.5 rounded-full ${displayStatus === "running" ? "animate-pulse bg-cyan-300" : displayStatus === "completed" ? "bg-emerald-300" : displayStatus === "paused" ? "bg-amber-300" : displayStatus === "error" ? "bg-rose-300" : "bg-slate-500"}`} />{displayStatus.toUpperCase()}</div>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "REPLAY" })} disabled={state.status === "ready"} className="text-slate-500 hover:text-slate-200"><RotateCcw /> <span className="hidden lg:inline">Replay</span></Button>
            <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500 hover:text-slate-200"><RefreshCcw /> <span className="hidden lg:inline">Reset</span></Button>
            <Button variant="ghost" size="sm" onClick={()=>setLocale((current)=>current==="en"?"th":"en")} className="text-slate-500"><Languages /> {locale.toUpperCase()}</Button>
            <Button variant="ghost" size="icon-sm" onClick={()=>setPresentation(true)} aria-label="Presentation mode"><Maximize2 /></Button>
            <SettingsPanel profile={profile} scenario={scenario} method={method} responseStatus={responseStatus} contentType={contentType} customLatency={customLatency} httpVersion={httpVersion} visitMode={visitMode} onProfileChange={setProfile} onScenarioChange={setScenario} onMethodChange={setMethod} onResponseStatusChange={setResponseStatus} onContentTypeChange={setContentType} onCustomLatencyChange={setCustomLatency} onHttpVersionChange={setHttpVersion} onVisitModeChange={setVisitMode} />
          </div>
        </div>
      </header>

      <div className={`mx-auto max-w-[1520px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7 ${presentation ? "max-w-[1800px]" : ""}`}>
        {presentation && <Button variant="outline" size="sm" onClick={()=>setPresentation(false)} className="fixed right-4 top-4 z-50 border-slate-700 bg-slate-950/80"><Minimize2 /> Exit presentation</Button>}
        <form onSubmit={(event) => { event.preventDefault(); run(); }} className={`rounded-lg border border-slate-800/90 bg-[#08111c]/95 p-3 sm:p-4 ${presentation ? "hidden" : ""}`}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/70" size={17} /><input value={input} onChange={(event) => { setInput(event.target.value); setValidationError(""); }} aria-label="URL to simulate" aria-invalid={Boolean(validationError)} spellCheck={false} className={`h-12 w-full rounded-md border bg-[#050a12] pl-10 pr-4 font-mono text-sm text-slate-200 outline-none transition focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/10 ${validationError ? "border-rose-400/60" : "border-slate-700/90"}`} placeholder="https://example.com" /></div>
            <div className="flex gap-2"><Button type="submit" size="lg" className="h-12 flex-1 rounded-md bg-cyan-300 px-7 font-mono text-sm font-bold tracking-[.08em] text-[#031014] shadow-[0_0_24px_rgb(34_211_238/12%)] hover:bg-cyan-200 sm:flex-none"><Play className="fill-current" /> {text.run}</Button><Button type="button" size="lg" variant="outline" onClick={reset} className="h-12 border-slate-700 bg-transparent font-mono text-sm text-slate-400 hover:bg-slate-800/50">{text.reset}</Button></div>
          </div>
          {validationError ? <p role="alert" className="mt-2 font-mono text-sm text-rose-300">{validationError}</p> : <div className="mt-3 flex items-start justify-between gap-4 border-t border-slate-800/60 pt-3"><UrlSegments url={parsedForPreview} /><span className="hidden shrink-0 pt-2 font-mono text-xs tracking-wider text-slate-600 xl:block">{text.simulated}</span></div>}
        </form>

        <div className={`mt-4 flex flex-col gap-3 rounded-lg border border-slate-800/80 bg-[#07101a]/90 p-3 lg:flex-row lg:items-center lg:justify-between ${presentation ? "hidden" : ""}`}>
          <Tabs value={view} onValueChange={(value) => setView(value as ViewMode)}><TabsList className="bg-[#0d1826]"><TabsTrigger value="simulation" className="text-sm">{text.simulation}</TabsTrigger><TabsTrigger value="architecture" className="text-sm">{text.architecture}</TabsTrigger><TabsTrigger value="challenge" className="text-sm">{text.challenge}</TabsTrigger></TabsList></Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded border border-slate-800 px-3 py-2 font-mono text-xs text-slate-500"><span className="text-slate-300">{activeProfile.label}</span>{currentTiming !== null && ` · ${currentTiming}ms simulated`}</div>
            <Select value={mode} onValueChange={(value) => setMode(value as ExplanationMode)}><SelectTrigger size="sm" className="min-w-32 border-slate-700 bg-[#08111c]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="developer">Developer</SelectItem><SelectItem value="deep-dive">Deep Dive</SelectItem></SelectContent></Select>
            <Button type="button" variant="outline" size="sm" onClick={() => void share()} className="border-slate-700 bg-transparent text-slate-400 hover:bg-slate-800"><span className="sr-only">Copy shareable scenario URL</span>{copied ? <Check className="text-emerald-300" /> : <Copy />}{copied ? "Copied" : "Share"}</Button>
          </div>
        </div>

        <div className={`mt-4 grid gap-4 ${presentation ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_380px]"}`}>
          <div className="min-w-0 space-y-4">
            <div className="relative">
              {view === "simulation" && <SimulationCanvas stage={activeStage.id} url={state.parsedUrl} progress={state.progress} paused={state.status === "paused"} error={activeError} method={state.method} responseStatus={state.responseStatus} httpVersion={state.httpVersion} visitMode={state.visitMode} />}
              {view === "architecture" && <ArchitectureView activeIndex={state.activeIndex} />}
              {view === "challenge" && <ChallengePanel stageIndex={state.selectedIndex} />}
              {view === "simulation" && (state.status === "running" || state.status === "paused") && <Button type="button" size="icon" onClick={() => dispatch({ type: "TOGGLE_PAUSE" })} className="absolute bottom-4 right-4 rounded-full border border-cyan-300/30 bg-[#07131e] text-cyan-200 shadow-lg hover:bg-cyan-400/10" aria-label={state.status === "paused" ? "Resume simulation" : "Pause simulation"}>{state.status === "paused" ? <Play className="fill-current" /> : <Pause className="fill-current" />}</Button>}
              {view === "simulation" && <div className="absolute bottom-0 left-0 h-0.5 bg-cyan-300 transition-[width] duration-75" style={{ width: `${state.progress}%` }} />}
            </div>
            <StageTimeline activeIndex={state.activeIndex} selectedIndex={state.selectedIndex} status={state.status} onSelect={(index) => dispatch({ type: "SELECT_STAGE", index })} />
            <JourneyControls stageIndex={state.activeIndex} stageCount={stages.length} progress={state.progress} status={state.status} speed={speed} onPrevious={()=>dispatch({type:"JUMP_STAGE",index:Math.max(0,state.activeIndex-1)})} onNext={()=>dispatch({type:"JUMP_STAGE",index:Math.min(stages.length-1,state.activeIndex+1)})} onToggle={()=>dispatch({type:"TOGGLE_PAUSE"})} onReplay={()=>dispatch({type:"REPLAY"})} onProgress={(progress)=>dispatch({type:"SET_PROGRESS",progress})} onSpeed={setSpeed} />
            {state.status === "error" && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-400/25 bg-rose-400/6 p-4"><div><p className="text-sm font-medium text-rose-200">Journey stopped at {activeStage.title}</p><p className="mt-1 text-sm text-slate-500">Retry the same scenario, or clear the failure and run again.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>dispatch({type:"REPLAY"})}>Retry</Button><Button size="sm" onClick={clearFailureAndRun}>Clear failure</Button></div></div>}
          </div>
          {!presentation && <motion.div key={`${selectedStage.id}-${mode}`} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .2 }}><Inspector stage={selectedStage} url={state.parsedUrl} elapsed={state.elapsed} mode={mode} method={state.method} responseStatus={state.responseStatus} contentType={state.contentType} httpVersion={state.httpVersion} error={state.selectedIndex === state.activeIndex ? activeError : undefined} /></motion.div>}
        </div>

        {!presentation && <AdvancedTools elapsed={state.elapsed} profile={profile} visitMode={visitMode} httpVersion={httpVersion} url={normalizeUrl(input)} onPreset={applyPreset} />}

        <footer className={`mt-4 flex flex-col gap-2 border-t border-slate-800/60 py-4 font-mono text-xs tracking-wider text-slate-600 sm:flex-row sm:items-center sm:justify-between ${presentation ? "hidden" : ""}`}><span>URL JOURNEY / EDUCATIONAL NETWORK OBSERVATORY</span><span>SPACE PAUSE · R REPLAY · ESC RESET · ← → INSPECT</span></footer>
      </div>
      <Dialog open={Boolean(shareFallback)} onOpenChange={(open)=>{if(!open)setShareFallback("");}}><DialogContent className="border-slate-700 bg-[#08111c]"><DialogHeader><DialogTitle>Copy scenario link</DialogTitle><DialogDescription>Your browser did not allow automatic clipboard access. Copy this URL manually.</DialogDescription></DialogHeader><Input readOnly value={shareFallback} onFocus={(event)=>event.currentTarget.select()} className="font-mono text-xs" /></DialogContent></Dialog>
    </main>
  );
}
