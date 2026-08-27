import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = updateSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId ?? undefined,
        action: "UPDATE",
        entity: "User",
        entityId: session.user.id,
        newValues: { passwordChanged: true },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Settings Password PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
