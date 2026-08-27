import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Wifi, UtensilsCrossed, Car, Waves, WashingMachine, Wind, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { getListingDetail } from "@/lib/services/listings";
import { summarizeReviews } from "@/lib/services/ai";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { Rating } from "@/components/ui/Rating";
import { VerifiedHostBadge, InstantBookBadge } from "@/components/ui/Badge";

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  kitchen: UtensilsCrossed,
  parking: Car,
  pool: Waves,
  washer: WashingMachine,
  air_conditioning: Wind,
};

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingDetail(id);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: listing.description?.slice(0, 155),
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListingDetail(id), auth()]);

  if (!listing || listing.status !== "approved") {
    notFound();
  }

  const rating = listing.reviews.length
    ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
    : 0;

  const aiSummary = await summarizeReviews(
    listing.reviews.map((r) => ({ rating: r.rating, comment: r.comment })),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="font-heading text-2xl font-bold text-text-heading sm:text-3xl">
        {listing.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-muted">
        {listing.reviews.length > 0 && <Rating value={rating} count={listing.reviews.length} />}
        <span>{listing.address}</span>
        {listing.instantBook && <InstantBookBadge />}
      </div>

      <PhotoGallery photos={listing.photos} title={listing.title} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div>
              <p className="font-heading font-semibold text-text-heading">
                Hosted by {listing.host.name ?? "a Nestly host"}
              </p>
              <p className="text-sm text-text-muted">
                {listing.maxGuests ?? "—"} guests · {listing.bedrooms ?? "—"} bedrooms ·{" "}
                {listing.beds ?? "—"} beds · {listing.bathrooms ?? "—"} baths
              </p>
            </div>
            {listing.host.verified && <VerifiedHostBadge />}
          </div>

          <p className="mt-6 whitespace-pre-line text-text-body">{listing.description}</p>

          {listing.amenities.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-heading text-lg font-semibold text-text-heading">
                What this place offers
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {listing.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a] ?? Sparkles;
                  return (
                    <div key={a} className="flex items-center gap-3 text-sm text-text-body">
                      <Icon className="h-4 w-4 text-text-muted" />
                      <span className="capitalize">{a.replace("_", " ")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="font-heading text-lg font-semibold text-text-heading">
              Reviews {listing.reviews.length > 0 && `(${listing.reviews.length})`}
            </h2>

            {aiSummary && (
              <div className="mt-4 flex gap-3 rounded-xl bg-surface p-4">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                <p className="text-sm text-text-body">
                  <span className="font-semibold text-text-heading">AI summary: </span>
                  {aiSummary}
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {listing.reviews.slice(0, 6).map((review) => (
                <div key={review.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-heading">
                      {review.reviewer.name ?? "Guest"}
                    </span>
                  </div>
                  <Rating value={review.rating} size="sm" className="mt-1" />
                  <p className="mt-2 text-sm text-text-body">{review.comment}</p>
                </div>
              ))}
              {listing.reviews.length === 0 && (
                <p className="text-sm text-text-muted">No reviews yet — be the first to stay here.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <BookingWidget
            listingId={listing.id}
            basePricePerNight={Number(listing.basePricePerNight)}
            cleaningFee={Number(listing.cleaningFee)}
            maxGuests={listing.maxGuests}
            isLoggedIn={!!session?.user}
          />
        </div>
      </div>
    </div>
  );
}

function PhotoGallery({
  photos,
  title,
}: {
  photos: { id: string; url: string }[];
  title: string;
}) {
  if (photos.length === 0) {
    return (
      <div className="mt-6 aspect-[16/7] w-full rounded-2xl bg-surface" />
    );
  }

  const [main, ...rest] = photos;

  return (
    <div className="mt-6 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
      <div className="relative col-span-4 row-span-2 aspect-[16/9] sm:col-span-2">
        <Image src={main.url} alt={title} fill sizes="50vw" className="object-cover" priority />
      </div>
      {rest.slice(0, 4).map((photo) => (
        <div key={photo.id} className="relative hidden aspect-square sm:block">
          <Image src={photo.url} alt={title} fill sizes="25vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
