import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Anda harus login untuk memberi review" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { productId, rating, comment } = parsed.data;

  const hasPurchased = await prisma.orderItem.findFirst({
    where: { productId, order: { userId: session.user.id, status: "PAID" } },
  });
  if (!hasPurchased) {
    return NextResponse.json(
      { error: "Anda hanya bisa memberi review untuk produk yang sudah dibeli" },
      { status: 403 }
    );
  }

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Anda sudah memberi review untuk produk ini" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { productId, userId: session.user.id, rating, comment: comment || null },
  });

  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      ratingCount: agg._count.rating,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
