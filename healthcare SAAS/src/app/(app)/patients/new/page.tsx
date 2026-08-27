"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPatient } from "../../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Creating…" : "Create case"}
    </button>
  );
}

export default function NewPatientPage() {
  const [state, action] = useActionState(createPatient, null as { error?: string } | null);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/patients" className="text-sm text-muted transition hover:text-ink">
        ← Patients
      </Link>

      <div className="beam glass mt-5 p-8">
        <h1 className="text-2xl font-bold tracking-tight">New case</h1>
        <p className="mt-2 text-sm text-muted">
          Use a case reference code, never a patient name. Real identifiers wait until
          Phase 2 — after a signed BAA and HIPAA-eligible hosting.
        </p>

        <form action={action} className="mt-7 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="caseReference">Case reference</label>
              <input id="caseReference" name="caseReference" className="field" placeholder="RP-2026-014" required />
            </div>
            <div>
              <label className="label" htmlFor="bodyRegion">Body region</label>
              <input id="bodyRegion" name="bodyRegion" className="field" placeholder="Right knee" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="diagnosisSummary">Working diagnosis</label>
            <input
              id="diagnosisSummary"
              name="diagnosisSummary"
              className="field"
              placeholder="Post-op ACL reconstruction, week 6"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="insurer">Insurer</label>
              <input id="insurer" name="insurer" className="field" placeholder="BlueCross" />
            </div>
            <div>
              <label className="label" htmlFor="sessionsAuthorized">Sessions authorized</label>
              <input
                id="sessionsAuthorized"
                name="sessionsAuthorized"
                type="number"
                min={1}
                defaultValue={12}
                className="field"
              />
            </div>
          </div>

          {state?.error && (
            <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {state.error}
            </p>
          )}

          <Submit />
        </form>
      </div>
    </div>
  );
}
