import { SearchBar } from "@/components/search/SearchBar";
import { ListingCard } from "@/components/search/ListingCard";
import { getFeaturedListings } from "@/lib/services/listings";

export default async function HomePage() {
  const listings = await getFeaturedListings(8);

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-20 text-center">
          <h1 className="max-w-2xl font-heading text-4xl font-bold tracking-tight text-text-heading sm:text-5xl">
            Book stays, <span className="bg-gradient-to-r from-coral-from to-coral-to bg-clip-text text-transparent">not stress.</span>
          </h1>
          <p className="max-w-xl text-base text-text-muted sm:text-lg">
            Search thousands of verified stays, get AI-matched to what you actually want,
            and book with confidence — real-time availability, no double-booking, ever.
          </p>
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-heading text-2xl font-semibold text-text-heading">
            Featured stays
          </h2>
        </div>

        {listings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="font-heading text-lg font-semibold text-text-heading">
        No stays live yet
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">
        Run <code className="rounded bg-white px-1.5 py-0.5">npm run db:seed</code> after
        connecting a database to populate demo listings.
      </p>
    </div>
  );
}
