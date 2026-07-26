import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.topupOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const qrisImageUrl = order.method === "QRIS" ? await getSetting("qrisImageUrl", "/Qrispayment.png") : null;

  return NextResponse.json({ order, qrisImageUrl });
}
