import { Suspense } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { ListingCard } from "@/components/search/ListingCard";
import { searchListings } from "@/lib/services/listings";
import { SearchFilters } from "@/components/search/SearchFilters";

interface SearchPageProps {
  searchParams: Promise<{
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    priceMin?: string;
    priceMax?: string;
    amenities?: string;
    instantBook?: string;
    propertyType?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const listings = await searchListings({
    location: params.location,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: params.guests ? Number(params.guests) : undefined,
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    amenities: params.amenities ? params.amenities.split(",").filter(Boolean) : undefined,
    instantBookOnly: params.instantBook === "true",
    propertyType: params.propertyType,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex justify-center">
        <SearchBar
          defaultLocation={params.location}
          defaultCheckIn={params.checkIn}
          defaultCheckOut={params.checkOut}
          defaultGuests={params.guests ? Number(params.guests) : 1}
        />
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <Suspense fallback={null}>
          <SearchFilters />
        </Suspense>

        <div className="flex-1">
          <p className="mb-4 text-sm text-text-muted">
            {listings.length} {listings.length === 1 ? "stay" : "stays"}
            {params.location ? ` in "${params.location}"` : ""}
          </p>

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <p className="font-heading text-lg font-semibold text-text-heading">
                No stays match those filters
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Try widening your date range or clearing a filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
