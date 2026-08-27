"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveReport } from "@/app/(app)/actions";

function Buttons({ submitted }: { submitted: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button name="submit" value="0" className="btn-ghost" disabled={pending}>
        {pending ? "Saving…" : "Save edits"}
      </button>
      {!submitted && (
        <button name="submit" value="1" className="btn-primary" disabled={pending}>
          Mark as submitted
        </button>
      )}
    </div>
  );
}

export function ReportReviewer({
  reportId,
  patientId,
  draft,
  finalReport,
  submittedAt,
}: {
  reportId: string;
  patientId: string;
  draft: string;
  finalReport: string | null;
  submittedAt: Date | null;
}) {
  const [text, setText] = useState(finalReport ?? draft);

  return (
    <form action={saveReport} className="space-y-4">
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="patientId" value={patientId} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`chip ${submittedAt ? "text-emerald-300" : "text-fuchsia-300"}`}>
          {submittedAt
            ? `Submitted ${new Date(submittedAt).toLocaleDateString()}`
            : "Draft — review before submitting"}
        </span>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(text)}
          className="text-xs text-muted transition hover:text-cyan-300"
        >
          Copy to clipboard
        </button>
      </div>

      <textarea
        name="finalReport"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={20}
        className="field font-mono text-[13px] leading-relaxed"
      />

      <Buttons submitted={Boolean(submittedAt)} />
      <p className="text-xs text-muted">
        PhysioFlow never transmits to a payer. Copy the reviewed text into your portal or
        clearinghouse yourself.
      </p>
    </form>
  );
}
