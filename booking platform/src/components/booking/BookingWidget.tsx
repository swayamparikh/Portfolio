"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice, nightsBetween } from "@/lib/utils";

interface BookingWidgetProps {
  listingId: string;
  basePricePerNight: number;
  cleaningFee: number;
  maxGuests: number | null;
  isLoggedIn: boolean;
}

interface AvailabilityResponse {
  availability: { date: string; isBlocked: boolean; customPrice: string | null }[];
  bookedRanges: { checkIn: string; checkOut: string }[];
}

export function BookingWidget({
  listingId,
  basePricePerNight,
  cleaningFee,
  maxGuests,
  isLoggedIn,
}: BookingWidgetProps) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/availability`)
      .then((res) => res.json())
      .then(setAvailability)
      .catch(() => setAvailability(null));
  }, [listingId]);

  const disabledDates = useMemo(() => {
    if (!availability) return [{ before: new Date() }];
    const blocked = availability.availability
      .filter((a) => a.isBlocked)
      .map((a) => new Date(a.date));
    const bookedRanges = availability.bookedRanges.map((b) => ({
      from: new Date(b.checkIn),
      to: new Date(b.checkOut),
    }));
    return [{ before: new Date() }, ...blocked, ...bookedRanges];
  }, [availability]);

  const nights = range?.from && range?.to ? nightsBetween(range.from, range.to) : 0;
  const subtotal = nights * basePricePerNight;
  const serviceFee = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + cleaningFee + serviceFee) * 100) / 100;

  async function handleReserve() {
    setError(null);

    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/listing/${listingId}`);
      return;
    }
    if (!range?.from || !range?.to) {
      setError("Select your check-in and check-out dates.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          checkIn: range.from.toISOString(),
          checkOut: range.to.toISOString(),
          guestsCount: guests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not complete booking.");
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="sticky top-24 p-5">
      <div className="flex items-baseline gap-1">
        <span className="font-heading text-xl font-bold text-text-heading">
          {formatPrice(basePricePerNight)}
        </span>
        <span className="text-sm text-text-muted">/ night</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={(next) => {
            setRange(next);
            setError(null);
          }}
          disabled={disabledDates}
          numberOfMonths={1}
          className="p-3 [&_.rdp-day_selected]:bg-coral-to"
          classNames={{
            selected: "bg-coral-to text-white rounded-full",
            today: "font-bold text-coral-to",
          }}
        />
      </div>

      {nights === 0 && (
        <p className="mt-2 text-xs text-text-muted">
          {range?.from ? "Now pick a check-out date." : "Select your check-in and check-out dates."}
        </p>
      )}

      <label className="mt-4 flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm">
        <span className="font-medium text-text-heading">Guests</span>
        <input
          type="number"
          min={1}
          max={maxGuests ?? undefined}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-16 bg-transparent text-right outline-none"
        />
      </label>

      <AnimatePresence>
        {nights > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2 overflow-hidden text-sm"
          >
            <div className="flex justify-between text-text-body">
              <span>
                {formatPrice(basePricePerNight)} × {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-body">
              <span>Cleaning fee</span>
              <span>{formatPrice(cleaningFee)}</span>
            </div>
            <div className="flex justify-between text-text-body">
              <span>Service fee</span>
              <span>{formatPrice(serviceFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold text-text-heading">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-3 text-sm text-coral-to">{error}</p>}
      {success && (
        <p className="mt-3 text-sm text-trust">
          Booking request sent! Check your trips dashboard for status.
        </p>
      )}

      <Button
        onClick={handleReserve}
        disabled={submitting}
        className="mt-4 w-full justify-center"
        size="lg"
      >
        {submitting ? "Reserving…" : "Reserve"}
      </Button>

      <p className="mt-3 text-center text-xs text-text-muted">
        You won&apos;t be charged yet
      </p>
    </Card>
  );
}
