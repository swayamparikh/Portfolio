import Link from "next/link";
import { Heart, User } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/Button";
import { MobileNavMenu } from "@/components/layout/MobileNavMenu";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold">
          <span className="bg-gradient-to-r from-coral-from to-coral-to bg-clip-text text-transparent">
            Nestly
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-text-body md:flex">
          <Link href="/search" className="hover:text-text-heading">
            Explore stays
          </Link>
          {session?.user.role !== "host" && (
            <Link href="/become-a-host" className="hover:text-text-heading">
              Become a host
            </Link>
          )}
          {(session?.user.role === "host" || session?.user.role === "admin") && (
            <Link href="/host/dashboard" className="hover:text-text-heading">
              Host dashboard
            </Link>
          )}
          {session?.user.role === "admin" && (
            <Link href="/admin/analytics" className="hover:text-text-heading">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <MobileNavMenu isLoggedIn={!!session?.user} role={session?.user.role ?? null} />
          {session?.user ? (
            <>
              <Link
                href="/trips/wishlist"
                className="hidden text-text-muted hover:text-coral-to sm:block"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href="/trips"
                aria-label="Your trips"
                className="flex items-center gap-2 rounded-full border border-border px-2 py-1.5 text-sm font-medium hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] sm:px-3"
              >
                <User className="h-5 w-5 rounded-full bg-surface p-0.5 text-text-muted" />
                <span className="hidden sm:inline">Trips</span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="hidden text-sm font-medium text-text-muted hover:text-text-heading md:block"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button href="/signup" variant="primary" size="sm">
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
