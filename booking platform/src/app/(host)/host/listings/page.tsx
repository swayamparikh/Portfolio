import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Your listings" };

const statusTone = {
  approved: "trust",
  pending: "ocean",
  rejected: "coral",
  suspended: "coral",
} as const;

export default async function HostListingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/listings");

  const listings = await prisma.listing.findMany({
    where: { hostId: session.user.id },
    include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-text-heading">Your listings</h1>
      </div>

      {listings.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">
          No listings yet.{" "}
          <Link href="/host/listings/new" className="font-medium text-ocean">
            Create your first listing
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden" hover>
              <Link href={`/host/listings/${listing.id}`}>
                <div className="relative aspect-[16/9] bg-surface">
                  {listing.photos[0] && (
                    <Image src={listing.photos[0].url} alt={listing.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading font-semibold text-text-heading">{listing.title}</p>
                    <Badge tone={statusTone[listing.status]}>{listing.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{listing.address}</p>
                  <p className="mt-1 text-sm font-medium text-text-heading">
                    {formatPrice(Number(listing.basePricePerNight))} / night
                  </p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
