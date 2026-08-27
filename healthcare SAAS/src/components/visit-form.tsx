"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { logVisit } from "@/app/(app)/actions";

type PatientOption = {
  id: string;
  caseReference: string;
  diagnosisSummary: string;
  sessionsAuthorized: number;
  visitCount: number;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-void/40 border-t-void" />
          Drafting note…
        </>
      ) : (
        <>Generate SOAP draft <span aria-hidden>→</span></>
      )}
    </button>
  );
}

export function VisitForm({
  patients,
  preselect,
}: {
  patients: PatientOption[];
  preselect?: string;
}) {
  const [state, action] = useActionState(logVisit, null as { error?: string } | null);
  const [selected, setSelected] = useState(preselect ?? patients[0]?.id ?? "");
  const [pain, setPain] = useState(4);

  const current = patients.find((p) => p.id === selected);

  return (
    <form action={action} className="beam glass space-y-6 p-7">
      <div>
        <label className="label" htmlFor="patientId">Patient</label>
        <select
          id="patientId"
          name="patientId"
          className="field"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          required
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id} className="bg-panel">
              {p.caseReference} — {p.diagnosisSummary}
            </option>
          ))}
        </select>
        {current && (
          <p className="mt-2 text-xs text-muted">
            This will be session{" "}
            <span className="font-semibold text-cyan-300">{current.visitCount + 1}</span> of{" "}
            {current.sessionsAuthorized} authorized.
            {current.visitCount + 1 >= current.sessionsAuthorized - 2 && (
              <span className="ml-1 text-amber-300">Re-authorization report due soon.</span>
            )}
          </p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="painScore">
          Pain — NPRS <span className="ml-1 font-mono text-cyan-300">{pain}/10</span>
        </label>
        <input
          id="painScore"
          name="painScore"
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={pain}
          onChange={(e) => setPain(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 accent-cyan-400"
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-muted">
          <span>No pain</span>
          <span>Worst imaginable</span>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="rom">Range of motion</label>
        <input
          id="rom"
          name="rom"
          className="field"
          placeholder="flexion 118, extension 0"
        />
        <p className="mt-1.5 text-xs text-muted">
          Comma separated, <span className="font-mono">name value</span> in degrees. These
          become plotted outcome measures.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="exercises">Exercises performed</label>
        <textarea
          id="exercises"
          name="exercises"
          rows={4}
          className="field font-mono text-[13px]"
          placeholder={"Leg press 3x12 @ 40kg — good depth\nStep downs 3x10 — no valgus\nBike 8min"}
        />
        <p className="mt-1.5 text-xs text-muted">
          One per line. <span className="font-mono">sets x reps @ load — note</span> is parsed
          automatically.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="rawInputText">Anything else</label>
        <textarea
          id="rawInputText"
          name="rawInputText"
          rows={4}
          className="field"
          placeholder="Reports stairs much easier this week. Still guarding on descent. Wants to know about jogging."
        />
        <p className="mt-1.5 text-xs text-muted">
          Fragments are fine — this is what you&apos;d mutter into a recorder between patients.
        </p>
      </div>

      {state?.error && (
        <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-white/5 pt-5">
        <Submit />
        <p className="text-xs text-muted">
          Nothing is saved to the record until you review the draft.
        </p>
      </div>
    </form>
  );
}
