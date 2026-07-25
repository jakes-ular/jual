import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  action: z.enum(["unsuspend", "dismiss"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const appeal = await prisma.appeal.findUnique({ where: { id } });
  if (!appeal) return NextResponse.json({ error: "Appeal tidak ditemukan" }, { status: 404 });

  if (parsed.data.action === "unsuspend") {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: appeal.userId },
        data: { status: "ACTIVE", suspensionReason: null },
      }),
      prisma.appeal.update({
        where: { id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      }),
    ]);
  } else {
    await prisma.appeal.update({
      where: { id },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
