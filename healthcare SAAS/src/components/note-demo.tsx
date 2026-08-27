"use client";

import { useEffect, useState } from "react";

const RAW = `knee ACL wk6, pain 3 today was 5 last wk
flexion 118 (was 105), ext full
leg press 3x12 40kg, step downs 3x10, bike 8min
form good on step downs now, no valgus
next: start light jogging progression`;

const NOTE = `**Subjective**
Patient attends session 7 of 12 at week 6 post ACL reconstruction. Reports pain 3/10 (NPRS), improved from 5/10 last session. No new complaints; tolerating current load well.

**Objective**
Knee AROM: flexion 118° (105° prior), extension full/symmetrical.
Leg press 3x12 @ 40kg; step-downs 3x10 with no dynamic valgus observed — a change from prior sessions; stationary bike 8 min.

**Assessment**
Progressing well. Flexion improved 13° since last visit and pain down 2 points. Resolution of dynamic valgus on step-downs indicates improving frontal-plane control, appropriate for week 6 criteria-based progression. On track within remaining authorized sessions.

**Plan**
Initiate graded return-to-jog progression next session pending pain-free single-leg loading. Continue strength progression and reassess AROM and NPRS. Update HEP accordingly.`;

export function NoteDemo() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "thinking" | "done">("typing");
  const [noteShown, setNoteShown] = useState("");

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      setTyped(RAW.slice(0, i));
      if (i >= RAW.length) {
        clearInterval(t);
        setPhase("thinking");
      }
    }, 28);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== "thinking") return;
    const kick = setTimeout(() => setPhase("done"), 1100);
    return () => clearTimeout(kick);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    let i = 0;
    const t = setInterval(() => {
      i += 9;
      setNoteShown(NOTE.slice(0, i));
      if (i >= NOTE.length) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [phase]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Input */}
      <div className="glass overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-xs font-medium text-muted">Quick input</span>
        </div>
        <pre className="min-h-[280px] whitespace-pre-wrap p-6 font-mono text-[13px] leading-relaxed text-cyan-100/90">
          {typed}
          <span className="ml-0.5 inline-block h-4 w-[7px] translate-y-0.5 animate-pulse bg-cyan-400" />
        </pre>
      </div>

      {/* Output */}
      <div className="beam glass relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <span className="text-xs font-medium text-muted">Drafted SOAP note</span>
          <span className="chip text-[10px] text-cyan-300">
            {phase === "done" ? "Ready for review" : "Generating"}
          </span>
        </div>
        <div className="relative min-h-[280px] p-6">
          {phase !== "done" ? (
            <div className="flex h-full flex-col justify-center gap-3">
              {[90, 70, 80, 55].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w}%`, animationDelay: `${i * 160}ms` }}
                  className="h-3 animate-pulse rounded bg-white/8"
                />
              ))}
              <p className="mt-4 text-xs text-muted">
                Reading 6 prior visits for this case reference…
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-[13px] leading-relaxed text-ink/90">
              {noteShown.split("\n").map((line, i) =>
                line.startsWith("**") ? (
                  <h4 key={i} className="pt-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                    {line.replace(/\*\*/g, "")}
                  </h4>
                ) : (
                  <p key={i}>{line}</p>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
