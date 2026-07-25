import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ productIds: [] });
  }

  const items = await prisma.orderItem.findMany({
    where: { order: { userId: session.user.id, status: "PAID" } },
    select: { productId: true },
    distinct: ["productId"],
  });

  return NextResponse.json({ productIds: items.map((i) => i.productId) });
}
