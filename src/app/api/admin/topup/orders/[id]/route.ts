import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { notifyPaymentConfirmed } from "@/lib/discord";
import { formatRupiah } from "@/lib/utils";

const statusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "CANCELLED", "EXPIRED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const order = await prisma.topupOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

  const newStatus = parsed.data.status;
  const wasPaid = order.status === "PAID";
  const becomesPaid = newStatus === "PAID";

  const updated = await prisma.topupOrder.update({
    where: { id },
    data: {
      status: newStatus,
      paidAt: becomesPaid ? new Date() : order.paidAt,
      confirmedById: becomesPaid ? auth.session.user.id : order.confirmedById,
    },
  });

  if (becomesPaid && !wasPaid) {
    await notifyPaymentConfirmed({
      orderNumber: order.orderNumber,
      buyerName: order.buyerName,
      total: formatRupiah(order.price),
    });
  }

  return NextResponse.json({ order: updated });
}
