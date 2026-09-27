import { Check } from "lucide-react";
import type { RunStatus } from "@/types/simulation";
import { stages } from "@/simulation/stages";

interface TimelineProps {
  activeIndex: number;
  selectedIndex: number;
  status: RunStatus;
  onSelect: (index: number) => void;
}

export function StageTimeline({ activeIndex, selectedIndex, status, onSelect }: TimelineProps) {
  return (
    <nav aria-label="Simulation stages" className="overflow-x-auto rounded-lg border border-slate-800/90 bg-[#08111c]/90 px-3 py-4 scrollbar-none">
      <ol className="flex min-w-[760px] items-start">
        {stages.map((stage, index) => {
          const done = index < activeIndex || status === "completed";
          const active = index === activeIndex && status !== "completed" && status !== "ready";
          const failed = active && status === "error";
          const selected = index === selectedIndex;
          return (
            <li key={stage.id} className="relative flex flex-1 flex-col items-center">
              {index > 0 && <span className={`absolute right-1/2 top-[9px] h-px w-full ${done || active ? "bg-cyan-400/45" : "bg-slate-800"}`} />}
              <button
                type="button"
                onClick={() => onSelect(index)}
                className="group relative z-10 flex flex-col items-center gap-2 focus-visible:outline-none"
                aria-current={active ? "step" : undefined}
              >
                <span className={`grid h-[19px] w-[19px] place-items-center rounded-full border transition ${failed ? "border-rose-400 bg-rose-400/15 shadow-[0_0_14px_rgb(251_113_133/35%)]" : active ? "border-cyan-300 bg-cyan-400/15 shadow-[0_0_14px_rgb(34_211_238/45%)]" : done ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300" : "border-slate-700 bg-[#08111c]"} ${selected ? "ring-2 ring-cyan-400/20 ring-offset-2 ring-offset-[#08111c]" : ""}`}>
                  {done ? <Check size={11} /> : active ? <span className={`h-1.5 w-1.5 rounded-full ${failed ? "bg-rose-300" : "bg-cyan-300"}`} /> : <span className="h-1 w-1 rounded-full bg-slate-700" />}
                </span>
                <span className={`font-mono text-[9px] tracking-wider ${selected ? "text-cyan-200" : "text-slate-600"}`}>{stage.shortTitle}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
