"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, ActivityLogEntry } from "@/lib/db/schema";

export function LeadDetailClient({ lead, activity }: { lead: Lead; activity: ActivityLogEntry[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [doNotContact, setDoNotContact] = useState(lead.doNotContact);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes, doNotContact }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold">{lead.companyName || lead.domain || "Unnamed lead"}</h1>
      <p className="mb-6 text-sm opacity-60">{lead.contactName} · {lead.title}</p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Email" value={lead.email} />
        <Field label="Domain" value={lead.domain} />
        <Field label="LinkedIn" value={lead.linkedinUrl} />
        <Field label="Industry" value={lead.industry} />
        <Field label="Company size" value={lead.companySize?.toString()} />
        <Field label="Geo" value={lead.geo} />
        <Field label="Fit score" value={lead.fitScore?.toString()} />
        <Field label="Service tags" value={(lead.serviceTags as string[] | null)?.join(", ")} />
        <Field label="Sequence status" value={lead.sequenceStatus} />
        <Field label="Reply sentiment" value={lead.replySentiment} />
        <Field label="Funding" value={lead.fundingStatus} />
        <Field
          label="Hiring signals"
          value={(lead.hiringSignals as string[] | null)?.join(", ")}
        />
        <Field label="Tech stack" value={(lead.techStack as string[] | null)?.join(", ")} />
      </div>

      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded border border-black/20 bg-transparent p-2 text-sm dark:border-white/20"
        />
      </div>

      <div className="mb-6 flex items-center gap-2">
        <input
          id="dnc"
          type="checkbox"
          checked={doNotContact}
          onChange={(e) => setDoNotContact(e.target.checked)}
        />
        <label htmlFor="dnc" className="text-sm">
          Do not contact
        </label>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {saving ? "Saving…" : "Save"}
      </button>

      <h2 className="mb-2 mt-10 text-sm font-semibold">Activity</h2>
      <div className="space-y-2">
        {activity.map((a) => (
          <div key={a.id} className="rounded border border-black/10 p-2 text-sm dark:border-white/10">
            <span className="font-medium">{a.eventType}</span>{" "}
            <span className="opacity-60">{new Date(a.timestamp).toLocaleString()}</span>
          </div>
        ))}
        {activity.length === 0 && <p className="text-sm opacity-50">No activity logged yet.</p>}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs opacity-60">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}
