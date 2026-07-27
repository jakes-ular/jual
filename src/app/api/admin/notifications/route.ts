import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

// Powers the pending-order badge counts in the admin sidebar. "Pending"
// here means awaiting confirmation -- the only order state that actually
// needs an admin to look at it.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [orderCount, topupOrderCount] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.topupOrder.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({ orderCount, topupOrderCount });
}
