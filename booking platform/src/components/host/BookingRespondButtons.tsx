"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function BookingRespondButtons({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function respond(action: "accept" | "decline") {
    setLoading(action);
    try {
      const res = await fetch(`/api/host/bookings/${bookingId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => respond("decline")} disabled={loading !== null}>
        {loading === "decline" ? "Declining…" : "Decline"}
      </Button>
      <Button size="sm" onClick={() => respond("accept")} disabled={loading !== null}>
        {loading === "accept" ? "Accepting…" : "Accept"}
      </Button>
    </div>
  );
}
