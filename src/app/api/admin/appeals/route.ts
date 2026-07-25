import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const appeals = await prisma.appeal.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true, status: true, suspensionReason: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ appeals });
}
