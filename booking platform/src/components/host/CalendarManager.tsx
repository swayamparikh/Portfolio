"use client";

import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useMediaQuery } from "@/lib/useMediaQuery";

interface DayState {
  isBlocked: boolean;
  customPrice: number | null;
  aiSuggestedPrice?: number;
}

export function CalendarManager({
  listingId,
  basePricePerNight,
  initialAvailability,
}: {
  listingId: string;
  basePricePerNight: number;
  initialAvailability: { date: string; isBlocked: boolean; customPrice: number | null }[];
}) {
  const [days, setDays] = useState<Record<string, DayState>>(() => {
    const map: Record<string, DayState> = {};
    for (const a of initialAvailability) {
      map[a.date] = { isBlocked: a.isBlocked, customPrice: a.customPrice };
    }
    return map;
  });
  const [selected, setSelected] = useState<Date | undefined>();
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  const selectedKey = selected ? toKey(selected) : null;
  const selectedState = selectedKey ? days[selectedKey] : undefined;

  const blockedDates = useMemo(
    () => Object.entries(days).filter(([, v]) => v.isBlocked).map(([k]) => fromKey(k)),
    [days],
  );
  const customPricedDates = useMemo(
    () => Object.entries(days).filter(([, v]) => v.customPrice != null).map(([k]) => fromKey(k)),
    [days],
  );

  function updateDay(key: string, patch: Partial<DayState>) {
    setDays((prev) => {
      const base: DayState = prev[key] ?? { isBlocked: false, customPrice: null };
      return { ...prev, [key]: { ...base, ...patch } };
    });
    setDirty((prev) => new Set(prev).add(key));
  }

  async function fetchAiSuggestions() {
    setLoadingAi(true);
    try {
      const from = new Date();
      const to = new Date(from.getTime() + 1000 * 60 * 60 * 24 * 30);
      const res = await fetch(
        `/api/host/listings/${listingId}/ai-price-suggestion?from=${from.toISOString()}&to=${to.toISOString()}`,
      );
      const data = await res.json();
      if (res.ok) {
        setDays((prev) => {
          const next = { ...prev };
          for (const s of data.suggestions as { date: string; suggestedPrice: number }[]) {
            next[s.date] = { ...next[s.date], isBlocked: next[s.date]?.isBlocked ?? false, customPrice: next[s.date]?.customPrice ?? null, aiSuggestedPrice: s.suggestedPrice };
          }
          return next;
        });
      }
    } finally {
      setLoadingAi(false);
    }
  }

  async function saveChanges() {
    if (dirty.size === 0) return;
    setSaving(true);
    try {
      const payload = Array.from(dirty).map((key) => ({
        date: key,
        isBlocked: days[key]?.isBlocked ?? false,
        customPrice: days[key]?.customPrice ?? null,
      }));
      const res = await fetch(`/api/host/listings/${listingId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: payload }),
      });
      if (res.ok) setDirty(new Set());
    } finally {
      setSaving(false);
    }
  }

  const isWideScreen = useMediaQuery("(min-width: 640px)");

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row">
      <Card className="overflow-x-auto p-4">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          numberOfMonths={isWideScreen ? 2 : 1}
          disabled={{ before: new Date() }}
          modifiers={{ blocked: blockedDates, custom: customPricedDates }}
          modifiersClassNames={{
            blocked: "line-through text-text-muted bg-surface",
            custom: "border border-ocean rounded-full",
          }}
        />
      </Card>

      <div className="flex-1 space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-text-heading">AI Smart Pricing</h3>
            <Button size="sm" variant="secondary" onClick={fetchAiSuggestions} disabled={loadingAi}>
              <Sparkles className="h-4 w-4" />
              {loadingAi ? "Analyzing…" : "Suggest next 30 days"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Suggestions factor in weekends, peak season, and comparable listings of the same
            property type. Click a suggested day on the calendar to accept it.
          </p>
        </Card>

        <Card className="p-5">
          <h3 className="font-heading font-semibold text-text-heading">
            {selected ? selected.toDateString() : "Select a date"}
          </h3>

          {selectedKey && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-text-muted">
                Base price: {formatPrice(basePricePerNight)}
                {selectedState?.aiSuggestedPrice != null && (
                  <>
                    {" · "}
                    <span className="text-ocean">
                      AI suggests {formatPrice(selectedState.aiSuggestedPrice)}
                    </span>
                  </>
                )}
              </p>

              <label className="flex items-center gap-2 text-sm text-text-body">
                <input
                  type="checkbox"
                  checked={selectedState?.isBlocked ?? false}
                  onChange={(e) => updateDay(selectedKey, { isBlocked: e.target.checked })}
                />
                Block this date
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-text-heading">
                  Custom price for this date
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={selectedState?.customPrice ?? ""}
                    placeholder={String(basePricePerNight)}
                    onChange={(e) =>
                      updateDay(selectedKey, {
                        customPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-32 rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-ocean"
                  />
                  {selectedState?.aiSuggestedPrice != null && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateDay(selectedKey, { customPrice: selectedState.aiSuggestedPrice! })
                      }
                    >
                      Use AI price
                    </Button>
                  )}
                </div>
              </label>
            </div>
          )}
        </Card>

        <Button onClick={saveChanges} disabled={dirty.size === 0 || saving} className="w-full justify-center">
          {saving ? "Saving…" : dirty.size > 0 ? `Save ${dirty.size} change${dirty.size > 1 ? "s" : ""}` : "No changes to save"}
        </Button>
      </div>
    </div>
  );
}

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fromKey(k: string) {
  return new Date(`${k}T00:00:00`);
}
