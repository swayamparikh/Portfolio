"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveNote } from "@/app/(app)/actions";

function SaveButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : dirty ? "Save edited note" : "Approve & save note"}
    </button>
  );
}

export function NoteReviewer({
  visitId,
  patientId,
  draft,
  finalNote,
  reviewed,
}: {
  visitId: string;
  patientId: string;
  draft: string;
  finalNote: string | null;
  reviewed: boolean;
}) {
  const [text, setText] = useState(finalNote ?? draft);
  const [editing, setEditing] = useState(false);
  const dirty = text !== (finalNote ?? draft);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`chip ${reviewed ? "text-emerald-300" : "text-amber-300"}`}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${reviewed ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
            aria-hidden
          />
          {reviewed ? "Reviewed and saved" : "AI draft — awaiting your review"}
        </span>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="text-xs text-muted transition hover:text-cyan-300"
        >
          {editing ? "Preview" : "Edit text"}
        </button>
      </div>

      <form action={saveNote} className="space-y-4">
        <input type="hidden" name="visitId" value={visitId} />
        <input type="hidden" name="patientId" value={patientId} />

        {editing ? (
          <textarea
            name="finalNote"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={18}
            className="field font-mono text-[13px] leading-relaxed"
          />
        ) : (
          <>
            <input type="hidden" name="finalNote" value={text} />
            <div className="rounded-xl border border-white/8 bg-void/50 p-6 text-[14px] leading-relaxed">
              {text.split("\n").map((line, i) =>
                line.startsWith("**") || /^#{1,4}\s/.test(line) ? (
                  <h4
                    key={i}
                    className="mt-5 mb-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 first:mt-0"
                  >
                    {line.replace(/\*\*/g, "").replace(/^#{1,4}\s/, "")}
                  </h4>
                ) : line.trim() === "" ? (
                  <div key={i} className="h-2" />
                ) : (
                  <p key={i} className="text-ink/90">{line}</p>
                ),
              )}
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <SaveButton dirty={dirty} />
          <p className="text-xs text-muted">
            The note enters the patient record only when you save it.
          </p>
        </div>
      </form>
    </div>
  );
}
