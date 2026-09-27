"use client";

import { Settings2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { errorScenarios } from "@/simulation/scenarios";
import { networkProfiles } from "@/simulation/network";
import type { ErrorScenarioId, HttpMethod, NetworkProfileId } from "@/types/simulation";

interface SettingsPanelProps {
  profile: NetworkProfileId;
  scenario: ErrorScenarioId;
  method: HttpMethod;
  responseStatus: number;
  contentType: string;
  customLatency: number;
  onProfileChange: (value: NetworkProfileId) => void;
  onScenarioChange: (value: ErrorScenarioId) => void;
  onMethodChange: (value: HttpMethod) => void;
  onResponseStatusChange: (value: number) => void;
  onContentTypeChange: (value: string) => void;
  onCustomLatencyChange: (value: number) => void;
}

export function SettingsPanel(props: SettingsPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-200"><Settings2 /> <span className="hidden md:inline">Settings</span></Button>
      </SheetTrigger>
      <SheetContent className="border-slate-800 bg-[#07101b] sm:max-w-md">
        <SheetHeader className="border-b border-slate-800 p-6">
          <SheetTitle className="flex items-center gap-2 font-mono text-sm tracking-wider text-slate-100"><SlidersHorizontal size={17} className="text-cyan-300" /> SIMULATION SETTINGS</SheetTitle>
          <SheetDescription>Change simulated timing, failures, and request/response details.</SheetDescription>
        </SheetHeader>
        <div className="space-y-7 overflow-y-auto px-6 pb-8">
          <SettingBlock label="Network profile" hint="Timings are simulated and intended for comparison.">
            <Select value={props.profile} onValueChange={(value) => props.onProfileChange(value as NetworkProfileId)}>
              <SelectTrigger className="w-full border-slate-700 bg-[#050a12]"><SelectValue /></SelectTrigger>
              <SelectContent>{networkProfiles.map((profile) => <SelectItem key={profile.id} value={profile.id}>{profile.label} — {profile.description}</SelectItem>)}</SelectContent>
            </Select>
          </SettingBlock>

          {props.profile === "custom" && (
            <SettingBlock label={`Custom latency ×${props.customLatency.toFixed(1)}`} hint="Applies a multiplier to every stage.">
              <input type="range" min="0.5" max="4" step="0.1" value={props.customLatency} onChange={(event) => props.onCustomLatencyChange(Number(event.target.value))} className="w-full accent-cyan-300" />
            </SettingBlock>
          )}

          <SettingBlock label="Failure scenario" hint="The journey stops at the stage where the selected failure occurs.">
            <Select value={props.scenario} onValueChange={(value) => props.onScenarioChange(value as ErrorScenarioId)}>
              <SelectTrigger className="w-full border-slate-700 bg-[#050a12]"><SelectValue /></SelectTrigger>
              <SelectContent>{errorScenarios.map((scenario) => <SelectItem key={scenario.id} value={scenario.id}>{scenario.label}</SelectItem>)}</SelectContent>
            </Select>
          </SettingBlock>

          <div className="border-t border-slate-800 pt-6">
            <p className="font-mono text-[10px] tracking-[.15em] text-cyan-400">CUSTOM SCENARIO</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Change the representative HTTP exchange without sending a real request.</p>
          </div>

          <SettingBlock label="Request method">
            <Select value={props.method} onValueChange={(value) => props.onMethodChange(value as HttpMethod)}>
              <SelectTrigger className="w-full border-slate-700 bg-[#050a12]"><SelectValue /></SelectTrigger>
              <SelectContent>{(["GET", "HEAD", "POST"] as const).map((method) => <SelectItem key={method} value={method}>{method}</SelectItem>)}</SelectContent>
            </Select>
          </SettingBlock>
          <div className="grid grid-cols-2 gap-3">
            <SettingBlock label="Response status">
              <Input type="number" min={100} max={599} value={props.responseStatus} onChange={(event) => props.onResponseStatusChange(Number(event.target.value))} className="border-slate-700 bg-[#050a12] font-mono" />
            </SettingBlock>
            <SettingBlock label="Content type">
              <Input value={props.contentType} onChange={(event) => props.onContentTypeChange(event.target.value)} className="border-slate-700 bg-[#050a12] font-mono" />
            </SettingBlock>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SettingBlock({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      {children}
      {hint && <span className="block text-xs leading-5 text-slate-600">{hint}</span>}
    </label>
  );
}
