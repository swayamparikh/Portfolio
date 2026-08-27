import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/trips/wishlist");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-heading text-2xl font-bold text-text-heading">Wishlist</h1>
      <p className="mt-3 text-sm text-text-muted">
        Tap the heart on any listing to save it here. (Wishlist persistence ships once the
        `wishlists` table is added — currently saves are session-local.)
      </p>
    </div>
  );
}
