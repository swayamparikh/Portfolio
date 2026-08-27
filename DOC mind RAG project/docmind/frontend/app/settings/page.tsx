"use client";

import { useEffect, useState } from "react";
import { api, type Settings } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  async function save(patch: Partial<Settings>) {
    if (!settings) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    setSaving(true);
    setSaved(false);
    try {
      await api.updateSettings(patch);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function clearAll() {
    if (!confirm("This will permanently delete all documents and their index. Continue?")) return;
    setClearing(true);
    try {
      const docs = await api.listDocuments();
      for (const doc of docs) await api.deleteDocument(doc.id);
    } finally {
      setClearing(false);
    }
  }

  if (!settings) return <div className="p-8 font-mono text-sm text-muted">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-graphite">Settings</h1>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-heading text-sm font-semibold text-graphite">Chunking</h2>
        <div className="flex flex-col gap-4 font-mono text-xs text-muted">
          <label className="flex flex-col gap-1">
            Chunk size: {settings.chunk_size}
            <input
              type="range"
              min={200}
              max={2000}
              step={50}
              value={settings.chunk_size}
              onChange={(e) => save({ chunk_size: Number(e.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Overlap: {settings.chunk_overlap}
            <input
              type="range"
              min={0}
              max={500}
              step={20}
              value={settings.chunk_overlap}
              onChange={(e) => save({ chunk_overlap: Number(e.target.value) })}
            />
          </label>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-heading text-sm font-semibold text-graphite">Retrieval</h2>
        <div className="flex flex-col gap-4 font-mono text-xs text-muted">
          <label className="flex flex-col gap-1">
            Top-K: {settings.top_k}
            <input
              type="range"
              min={1}
              max={15}
              value={settings.top_k}
              onChange={(e) => save({ top_k: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.reranking}
              onChange={(e) => save({ reranking: e.target.checked })}
            />
            Reranking enabled
          </label>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 font-heading text-sm font-semibold text-graphite">Generation</h2>
        <div className="flex flex-col gap-4 font-mono text-xs text-muted">
          <label className="flex flex-col gap-1">
            Model
            <select
              value={settings.model}
              onChange={(e) => save({ model: e.target.value })}
              className="rounded-instrument border border-hairline px-2 py-1.5 text-graphite"
            >
              {GROQ_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Temperature: {settings.temperature.toFixed(2)}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.temperature}
              onChange={(e) => save({ temperature: Number(e.target.value) })}
            />
          </label>
        </div>
        {saving && <p className="mt-3 font-mono text-[11px] text-muted">Saving...</p>}
        {!saving && saved && <p className="mt-3 font-mono text-[11px] text-success">Saved — applies to next eval run.</p>}
      </Card>

      <Card className="mb-6 border-signal/30 p-6">
        <h2 className="mb-2 font-heading text-sm font-semibold text-signal">Danger Zone</h2>
        <p className="mb-4 font-mono text-xs text-muted">
          Permanently delete every document and its index. This cannot be undone.
        </p>
        <Button variant="danger" onClick={clearAll} disabled={clearing}>
          {clearing ? "Clearing..." : "Clear all documents & index"}
        </Button>
      </Card>

      <p className="font-mono text-xs text-muted">
        Idea &amp; Concept by Swayam Parikh —{" "}
        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-signal hover:underline">
          GitHub repo
        </a>
      </p>
    </div>
  );
}
