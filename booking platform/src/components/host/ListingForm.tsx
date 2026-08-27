"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const AMENITIES = ["wifi", "kitchen", "parking", "pool", "washer", "air_conditioning"];
const PROPERTY_TYPES = [
  { value: "entire_place", label: "Entire place" },
  { value: "private_room", label: "Private room" },
  { value: "shared_room", label: "Shared room" },
];

export function ListingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("entire_place");
  const [address, setAddress] = useState("");
  const [basePricePerNight, setBasePricePerNight] = useState(100);
  const [cleaningFee, setCleaningFee] = useState(40);
  const [maxGuests, setMaxGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [instantBook, setInstantBook] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function addPhoto() {
    if (!photoUrl.trim()) return;
    setPhotoUrls((prev) => [...prev, photoUrl.trim()]);
    setPhotoUrl("");
  }

  async function generateDescription() {
    if (!title.trim()) {
      setError("Add a title first so AI has something to work with.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/host/listings/ai-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, propertyType, amenities, bedrooms, address }),
      });
      const data = await res.json();
      if (res.ok) setDescription(data.description);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/host/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          propertyType,
          address,
          basePricePerNight,
          cleaningFee,
          maxGuests,
          bedrooms,
          beds,
          bathrooms,
          amenities,
          instantBook,
          photoUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create listing.");
      router.push(`/host/listings/${data.listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mt-6 p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>

        <Field label="Address">
          <input required value={address} onChange={(e) => setAddress(e.target.value)} className="input" />
        </Field>

        <Field label="Property type">
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input">
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-text-heading">Description</span>
            <button
              type="button"
              onClick={generateDescription}
              disabled={generating}
              className="flex items-center gap-1 text-xs font-medium text-ocean disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? "Writing…" : "Generate with AI"}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <NumberField label="Price / night ($)" value={basePricePerNight} onChange={setBasePricePerNight} />
          <NumberField label="Cleaning fee ($)" value={cleaningFee} onChange={setCleaningFee} />
          <NumberField label="Max guests" value={maxGuests} onChange={setMaxGuests} />
          <NumberField label="Bedrooms" value={bedrooms} onChange={setBedrooms} />
          <NumberField label="Beds" value={beds} onChange={setBeds} />
          <NumberField label="Bathrooms" value={bathrooms} onChange={setBathrooms} />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-text-heading">Amenities</p>
          <div className="flex flex-wrap gap-3">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-1.5 text-sm capitalize text-text-body">
                <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                {a.replace("_", " ")}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-text-body">
          <input type="checkbox" checked={instantBook} onChange={(e) => setInstantBook(e.target.checked)} />
          Enable Instant Book
        </label>

        <div>
          <p className="mb-1 text-xs font-semibold text-text-heading">Photos (image URLs)</p>
          <div className="flex gap-2">
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
              className="input"
            />
            <Button type="button" variant="outline" size="sm" onClick={addPhoto}>
              Add
            </Button>
          </div>
          {photoUrls.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-text-muted">
              {photoUrls.map((url) => (
                <li key={url} className="truncate">{url}</li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-coral-to">{error}</p>}

        <Button type="submit" disabled={submitting} size="lg" className="w-full justify-center">
          {submitting ? "Creating…" : "Submit for review"}
        </Button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: var(--ocean);
        }
      `}</style>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-text-heading">{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input"
      />
    </Field>
  );
}
