"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Network, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const steps = [
  { icon: Play, title: "Run a journey", text: "Enter any HTTP or HTTPS URL. The app simulates the journey without contacting that website." },
  { icon: Network, title: "Change the conditions", text: "Try mobile networks, cached visits, HTTP versions, redirects, and failures from Settings or Presets." },
  { icon: BookOpen, title: "Inspect and practice", text: "Use the timeline, explanation modes, waterfall, glossary, and challenges to explore each concept." },
] as const;

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  useEffect(() => { if (window.localStorage.getItem("url-journey-onboarded") !== "1") setOpen(true); }, []);
  const finish = () => { window.localStorage.setItem("url-journey-onboarded", "1"); setOpen(false); };
  const item = steps[step]; const Icon = item.icon;
  return (
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="border-slate-700 bg-[#08111c] sm:max-w-lg"><DialogHeader><div className="mb-3 grid h-11 w-11 place-items-center rounded-lg border border-cyan-400/25 bg-cyan-400/8 text-cyan-300"><Icon /></div><DialogTitle>{item.title}</DialogTitle><DialogDescription className="pt-2 text-sm leading-6">{item.text}</DialogDescription></DialogHeader><div className="flex gap-2 py-2">{steps.map((_,index)=><span key={index} className={`h-1.5 flex-1 rounded ${index<=step?"bg-cyan-300":"bg-slate-800"}`} />)}</div><DialogFooter><Button variant="ghost" onClick={finish}>Skip</Button><Button onClick={()=> step===steps.length-1 ? finish() : setStep((current)=>current+1)}>{step===steps.length-1?"Start exploring":"Next"}<ArrowRight /></Button></DialogFooter></DialogContent></Dialog>
  );
}
