import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Messages" };

export default async function HostMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/messages");

  const bookings = await prisma.booking.findMany({
    where: { listing: { hostId: session.user.id } },
    include: {
      listing: { select: { title: true } },
      guest: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Messages</h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No conversations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/messages/${b.id}`}>
              <Card hover className="p-4">
                <p className="font-medium text-text-heading">
                  {b.guest.name ?? b.guest.email} — {b.listing.title}
                </p>
                <p className="mt-1 truncate text-sm text-text-muted">
                  {b.messages[0]?.content ?? "No messages yet — say hello."}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
