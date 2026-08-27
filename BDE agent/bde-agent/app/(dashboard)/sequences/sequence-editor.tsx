"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Sequence } from "@/lib/db/schema";

export function SequenceEditor({ sequence }: { sequence: Sequence }) {
  const router = useRouter();
  const [subject, setSubject] = useState(sequence.subject);
  const [body, setBody] = useState(sequence.templateBody);
  const [delayDays, setDelayDays] = useState(sequence.delayDays);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/sequences/${sequence.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, templateBody: body, delayDays }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="rounded border border-black/10 p-3 dark:border-white/10">
      <div className="mb-2 flex items-center justify-between text-xs opacity-60">
        <span>Step {sequence.stepNumber}</span>
        <span className="flex items-center gap-1">
          Delay (days):
          <input
            type="number"
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-14 rounded border border-black/20 bg-transparent px-1 dark:border-white/20"
          />
        </span>
      </div>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mb-2 w-full rounded border border-black/20 bg-transparent px-2 py-1 text-sm font-medium dark:border-white/20"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        className="w-full rounded border border-black/20 bg-transparent p-2 text-sm dark:border-white/20"
      />
      <button
        onClick={save}
        disabled={saving}
        className="mt-2 rounded bg-black px-3 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
