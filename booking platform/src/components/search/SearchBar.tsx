"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Search as SearchIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SearchBar({
  defaultLocation = "",
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = 1,
}: {
  defaultLocation?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
}) {
  const router = useRouter();
  const [location, setLocation] = useState(defaultLocation);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-border bg-white p-2 shadow-[0_6px_16px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:rounded-full"
    >
      <label className="flex flex-1 items-center gap-3 rounded-full px-4 py-3">
        <MapPin className="h-4 w-4 shrink-0 text-text-muted" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-heading">Where</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="w-full bg-transparent text-sm text-text-body outline-none placeholder:text-text-muted"
          />
        </div>
      </label>

      <div className="hidden h-8 w-px bg-border sm:block" />

      <label className="flex items-center gap-3 rounded-full px-4 py-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-heading">Check in</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-32 bg-transparent text-sm text-text-body outline-none"
          />
        </div>
      </label>

      <div className="hidden h-8 w-px bg-border sm:block" />

      <label className="flex items-center gap-3 rounded-full px-4 py-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-heading">Check out</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-32 bg-transparent text-sm text-text-body outline-none"
          />
        </div>
      </label>

      <div className="hidden h-8 w-px bg-border sm:block" />

      <label className="flex items-center gap-3 rounded-full px-4 py-3">
        <Users className="h-4 w-4 shrink-0 text-text-muted" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-text-heading">Guests</span>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-14 bg-transparent text-sm text-text-body outline-none"
          />
        </div>
      </label>

      <Button type="submit" size="lg" className="shrink-0 justify-center">
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
