import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/messages/MessageThread";

export const metadata = { title: "Messages" };

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { bookingId } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { listing: { select: { title: true, hostId: true } }, guest: { select: { id: true } } },
  });
  if (!booking) notFound();

  const isParticipant =
    booking.guestId === session.user.id || booking.listing.hostId === session.user.id;
  if (!isParticipant && session.user.role !== "admin") notFound();

  const recipientId =
    session.user.id === booking.guestId ? booking.listing.hostId : booking.guestId;

  const messages = await prisma.message.findMany({
    where: { bookingId },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="font-heading text-xl font-bold text-text-heading">{booking.listing.title}</h1>
      <p className="mb-4 text-sm text-text-muted">
        {booking.checkIn.toDateString()} – {booking.checkOut.toDateString()}
      </p>
      <MessageThread
        bookingId={bookingId}
        recipientId={recipientId}
        currentUserId={session.user.id}
        initialMessages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        canDraftWithAI={session.user.role === "host" || session.user.role === "admin"}
      />
    </div>
  );
}
