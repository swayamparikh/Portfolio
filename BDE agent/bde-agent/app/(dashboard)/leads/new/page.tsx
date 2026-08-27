"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Section 21 build-sequencing note: manual lead entry (CRUD) working before
// any scraper — lets you test scoring/sequencing/dashboard with fake data.
export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    domain: "",
    contactName: "",
    title: "",
    email: "",
    linkedinUrl: "",
    industry: "",
    companySize: "",
    geo: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        companySize: form.companySize ? Number(form.companySize) : undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    const created = await res.json();
    router.push(`/leads/${created.id}`);
  }

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "companyName", label: "Company name" },
    { key: "domain", label: "Domain" },
    { key: "contactName", label: "Contact name" },
    { key: "title", label: "Title" },
    { key: "email", label: "Email" },
    { key: "linkedinUrl", label: "LinkedIn URL" },
    { key: "industry", label: "Industry" },
    { key: "companySize", label: "Company size" },
    { key: "geo", label: "Geography" },
  ];

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-xl font-semibold">New Lead</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <label className="text-sm font-medium">{f.label}</label>
            <input
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className="w-full rounded border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/20"
            />
          </div>
        ))}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {saving ? "Saving…" : "Create lead"}
        </button>
      </form>
    </div>
  );
}
