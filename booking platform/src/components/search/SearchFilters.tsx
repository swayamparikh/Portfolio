"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const AMENITIES = ["wifi", "kitchen", "parking", "pool", "washer", "air_conditioning"];
const PROPERTY_TYPES = [
  { value: "entire_place", label: "Entire place" },
  { value: "private_room", label: "Private room" },
  { value: "shared_room", label: "Shared room" },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");
  const [amenities, setAmenities] = useState<string[]>(
    searchParams.get("amenities")?.split(",").filter(Boolean) ?? [],
  );
  const [instantBook, setInstantBook] = useState(searchParams.get("instantBook") === "true");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") ?? "");

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    priceMin ? params.set("priceMin", priceMin) : params.delete("priceMin");
    priceMax ? params.set("priceMax", priceMax) : params.delete("priceMax");
    amenities.length ? params.set("amenities", amenities.join(",")) : params.delete("amenities");
    instantBook ? params.set("instantBook", "true") : params.delete("instantBook");
    propertyType ? params.set("propertyType", propertyType) : params.delete("propertyType");
    router.push(`/search?${params.toString()}`);
  }

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-border bg-white p-5 lg:w-64">
      <h3 className="font-heading text-sm font-semibold text-text-heading">Filters</h3>

      <div className="mt-4">
        <p className="text-xs font-semibold text-text-muted">Price per night</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-ocean"
          />
          <span className="text-text-muted">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-ocean"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-text-muted">Property type</p>
        <div className="mt-2 space-y-1.5">
          {PROPERTY_TYPES.map((pt) => (
            <label key={pt.value} className="flex items-center gap-2 text-sm text-text-body">
              <input
                type="radio"
                name="propertyType"
                checked={propertyType === pt.value}
                onChange={() => setPropertyType(pt.value)}
              />
              {pt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold text-text-muted">Amenities</p>
        <div className="mt-2 space-y-1.5">
          {AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm capitalize text-text-body">
              <input
                type="checkbox"
                checked={amenities.includes(a)}
                onChange={() => toggleAmenity(a)}
              />
              {a.replace("_", " ")}
            </label>
          ))}
        </div>
      </div>

      <label className="mt-5 flex items-center gap-2 text-sm text-text-body">
        <input
          type="checkbox"
          checked={instantBook}
          onChange={(e) => setInstantBook(e.target.checked)}
        />
        Instant Book only
      </label>

      <Button size="sm" className="mt-5 w-full justify-center" onClick={applyFilters}>
        Apply filters
      </Button>
    </aside>
  );
}
