"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import type { UserRole } from "@/types/next-auth";

export function MobileNavMenu({
  isLoggedIn,
  role,
}: {
  isLoggedIn: boolean;
  role: UserRole | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-heading"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-border bg-white px-6 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
          <nav className="flex flex-col gap-1 text-sm font-medium text-text-body">
            <Link href="/search" className="rounded-lg px-3 py-2.5 hover:bg-surface" onClick={() => setOpen(false)}>
              Explore stays
            </Link>
            {role !== "host" && (
              <Link
                href="/become-a-host"
                className="rounded-lg px-3 py-2.5 hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                Become a host
              </Link>
            )}
            {(role === "host" || role === "admin") && (
              <Link
                href="/host/dashboard"
                className="rounded-lg px-3 py-2.5 hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                Host dashboard
              </Link>
            )}
            {role === "admin" && (
              <Link
                href="/admin/analytics"
                className="rounded-lg px-3 py-2.5 hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}
            {isLoggedIn && (
              <>
                <Link href="/trips" className="rounded-lg px-3 py-2.5 hover:bg-surface" onClick={() => setOpen(false)}>
                  Your trips
                </Link>
                <Link
                  href="/trips/wishlist"
                  className="rounded-lg px-3 py-2.5 hover:bg-surface"
                  onClick={() => setOpen(false)}
                >
                  Wishlist
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg px-3 py-2.5 text-left text-coral-to hover:bg-surface"
                >
                  Log out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
