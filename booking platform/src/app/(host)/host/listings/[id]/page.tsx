import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

const statusTone = {
  approved: "trust",
  pending: "ocean",
  rejected: "coral",
  suspended: "coral",
} as const;

export default async function HostListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!listing) notFound();
  if (listing.hostId !== session.user.id && session.user.role !== "admin") notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-heading">{listing.title}</h1>
          <p className="mt-1 text-sm text-text-muted">{listing.address}</p>
        </div>
        <Badge tone={statusTone[listing.status]}>{listing.status}</Badge>
      </div>

      {listing.status === "pending" && (
        <div className="mt-4 rounded-xl bg-surface p-4 text-sm text-text-body">
          This listing is awaiting admin approval before it goes live in search.
        </div>
      )}

      {listing.photos.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-2">
          {listing.photos.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-surface">
              <Image src={p.url} alt={listing.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Price / night" value={formatPrice(Number(listing.basePricePerNight))} />
        <Stat label="Max guests" value={String(listing.maxGuests ?? "—")} />
        <Stat label="Bedrooms" value={String(listing.bedrooms ?? "—")} />
        <Stat label="Instant Book" value={listing.instantBook ? "On" : "Off"} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={`/host/calendar/${listing.id}`} variant="secondary">
          Manage calendar & pricing
        </Button>
        {listing.status === "approved" && (
          <Button href={`/listing/${listing.id}`} variant="outline">
            View live listing
          </Button>
        )}
        <Link
          href="/host/listings"
          className="flex items-center text-sm font-medium text-text-muted hover:text-text-heading"
        >
          Back to listings
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 font-heading font-semibold text-text-heading">{value}</p>
    </Card>
  );
}
