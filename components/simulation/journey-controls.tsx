"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RunStatus } from "@/types/simulation";

interface JourneyControlsProps {
  stageIndex: number;
  stageCount: number;
  progress: number;
  status: RunStatus;
  speed: number;
  onPrevious: () => void;
  onNext: () => void;
  onToggle: () => void;
  onReplay: () => void;
  onProgress: (value: number) => void;
  onSpeed: (value: number) => void;
}

export function JourneyControls(props: JourneyControlsProps) {
  const canPlay = props.status === "running" || props.status === "paused";
  return (
    <div className="sticky bottom-3 z-40 mt-3 flex flex-col gap-3 rounded-lg border border-slate-700/90 bg-[#07101b]/95 p-3 shadow-2xl backdrop-blur md:static md:flex-row md:items-center">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={props.onPrevious} disabled={props.stageIndex === 0} aria-label="Previous stage"><ChevronLeft /></Button>
        <Button size="icon" onClick={props.onToggle} disabled={!canPlay} className="rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200" aria-label={props.status === "paused" ? "Resume" : "Pause"}>{props.status === "paused" ? <Play className="fill-current" /> : <Pause className="fill-current" />}</Button>
        <Button variant="ghost" size="icon-sm" onClick={props.onNext} disabled={props.stageIndex >= props.stageCount - 1} aria-label="Next stage"><ChevronRight /></Button>
        <Button variant="ghost" size="icon-sm" onClick={props.onReplay} aria-label="Replay"><RotateCcw /></Button>
      </div>
      <label className="flex min-w-0 flex-1 items-center gap-3">
        <span className="min-w-16 font-mono text-xs text-slate-500">{String(props.stageIndex + 1).padStart(2, "0")}/{String(props.stageCount).padStart(2, "0")}</span>
        <input aria-label="Stage progress" type="range" min="0" max="100" value={Math.round(props.progress)} onChange={(event) => props.onProgress(Number(event.target.value))} className="min-w-0 flex-1 accent-cyan-300" />
        <span className="w-10 text-right font-mono text-xs text-slate-500">{Math.round(props.progress)}%</span>
      </label>
      <Select value={String(props.speed)} onValueChange={(value) => props.onSpeed(Number(value))}><SelectTrigger size="sm" className="w-full border-slate-700 bg-slate-900/60 md:w-24"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0.5">0.5×</SelectItem><SelectItem value="1">1×</SelectItem><SelectItem value="1.5">1.5×</SelectItem><SelectItem value="2">2×</SelectItem></SelectContent></Select>
    </div>
  );
}
