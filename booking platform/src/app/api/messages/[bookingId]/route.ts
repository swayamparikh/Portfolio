import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await params;
  const messages = await prisma.message.findMany({
    where: { bookingId },
    include: { sender: { select: { name: true, profilePhotoUrl: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
  recipientId: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId: session.user.id,
      recipientId: parsed.data.recipientId,
      content: parsed.data.content,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
