import { redirect } from "next/navigation";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Listing approvals" };

async function setListingStatus(id: string, status: "approved" | "rejected") {
  "use server";
  const session = await auth();
  if (session?.user.role !== "admin") return;
  await prisma.listing.update({ where: { id }, data: { status } });
  revalidatePath("/admin/listings");
}

export default async function AdminListingsPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/");

  const pending = await prisma.listing.findMany({
    where: { status: "pending" },
    include: { host: { select: { name: true, email: true } }, photos: { take: 1, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Listing approvals</h1>
      <p className="mt-1 text-sm text-text-muted">{pending.length} listing(s) awaiting review</p>

      {pending.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">Nothing pending — all caught up.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {pending.map((listing) => (
            <Card key={listing.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-surface">
                {listing.photos[0] && (
                  <Image src={listing.photos[0].url} alt={listing.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-heading">{listing.title}</p>
                <p className="text-sm text-text-muted">
                  {listing.host.name ?? listing.host.email} · {listing.address}
                </p>
                <p className="text-sm text-text-muted">
                  {formatPrice(Number(listing.basePricePerNight))} / night
                </p>
              </div>
              <div className="flex gap-2">
                <form action={setListingStatus.bind(null, listing.id, "rejected")}>
                  <Button variant="outline" size="sm" type="submit">
                    Reject
                  </Button>
                </form>
                <form action={setListingStatus.bind(null, listing.id, "approved")}>
                  <Button size="sm" type="submit">
                    Approve
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
