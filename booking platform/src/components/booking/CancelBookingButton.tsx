"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel this booking? Refund amount depends on how close it is to check-in.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Booking cancelled. Refund: $${data.refundAmount} (${data.refundRate * 100}%).`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not cancel booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-sm font-medium text-text-muted hover:text-coral-to disabled:opacity-50"
    >
      {loading ? "Cancelling…" : "Cancel"}
    </button>
  );
}
