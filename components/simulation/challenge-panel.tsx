"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { challenges } from "@/data/challenges";

export function ChallengePanel({ stageIndex }: { stageIndex: number }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [level, setLevel] = useState<"guided" | "expert">("guided");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("url-journey-challenge");
      const parsed = saved ? JSON.parse(saved) as Record<number, number> : null;
      if (parsed) queueMicrotask(() => setAnswers(parsed));
    } catch { /* Ignore invalid local progress. */ }
  }, []);
  useEffect(() => { window.localStorage.setItem("url-journey-challenge", JSON.stringify(answers)); }, [answers]);
  const challenge = challenges[stageIndex];
  const selected = answers[stageIndex];
  const answered = selected !== undefined;
  const correct = answered && selected === challenge.correctIndex;
  const score = Object.entries(answers).filter(([index, answer]) => challenges[Number(index)]?.correctIndex === answer).length;

  return (
    <section className="min-h-[330px] rounded-lg border border-slate-800/90 bg-[#070d16]/95 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div><p className="font-mono text-xs tracking-[.12em] text-amber-300">CHALLENGE {String(stageIndex + 1).padStart(2, "0")} / {challenges.length}</p><h2 className="mt-2 max-w-2xl text-xl font-semibold leading-8 text-slate-100">{challenge.question}</h2></div>
        <div className="flex shrink-0 flex-col gap-2"><div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-center"><p className="font-mono text-xs text-amber-300/70">SCORE</p><p className="mt-1 font-mono text-lg text-amber-200">{score}/{challenges.length}</p></div><Select value={level} onValueChange={(value)=>setLevel(value as "guided"|"expert")}><SelectTrigger size="sm" className="border-slate-700"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="guided">Guided</SelectItem><SelectItem value="expert">Expert</SelectItem></SelectContent></Select></div>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {challenge.answers.map((answer, index) => {
          const isSelected = selected === index;
          const isCorrect = answered && index === challenge.correctIndex;
          return (
            <button key={answer} type="button" disabled={answered} onClick={() => setAnswers((current) => ({ ...current, [stageIndex]: index }))} className={`flex min-h-14 items-center gap-3 rounded-md border px-4 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${isCorrect ? "border-emerald-400/50 bg-emerald-400/8 text-emerald-200" : isSelected ? "border-rose-400/50 bg-rose-400/8 text-rose-200" : "border-slate-800 bg-[#09121d] text-slate-400 hover:border-slate-600 hover:text-slate-200"}`}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded border border-current/25 font-mono text-xs">{String.fromCharCode(65 + index)}</span>{answer}
            </button>
          );
        })}
      </div>
      {answered && (level === "guided" || correct) && (
        <div className={`mt-5 rounded-md border p-4 ${correct ? "border-emerald-400/20 bg-emerald-400/5" : "border-rose-400/20 bg-rose-400/5"}`}>
          <p className={`flex items-center gap-2 text-sm font-medium ${correct ? "text-emerald-300" : "text-rose-300"}`}>{correct ? <CheckCircle2 size={17} /> : <XCircle size={17} />}{correct ? "Correct" : "Not quite"}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{challenge.explanation}</p>
        </div>
      )}
      <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-600">Select another timeline stage for its question.</p>
        <Button variant="ghost" size="sm" onClick={() => {setAnswers({});window.localStorage.removeItem("url-journey-challenge");}} className="text-slate-500"><RotateCcw /> Reset score</Button>
      </div>
    </section>
  );
}
