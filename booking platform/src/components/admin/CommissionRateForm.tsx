"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function CommissionRateForm({ initialRate }: { initialRate: number }) {
  const [rate, setRate] = useState(Math.round(initialRate * 100));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings/commission-rate", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate: rate / 100 }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6 max-w-md p-6">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-text-heading">
          Platform commission rate
        </span>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={50}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-24 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ocean"
          />
          <span className="text-text-muted">%</span>
        </div>
      </label>
      <p className="mt-2 text-sm text-text-muted">
        Applied to every new booking&apos;s total to compute platform commission vs. host payout.
      </p>
      <Button onClick={save} disabled={saving} size="sm" className="mt-4">
        {saving ? "Saving…" : "Save"}
      </Button>
      {saved && <p className="mt-2 text-sm text-trust">Saved.</p>}
    </Card>
  );
}
