import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({ productId: z.string().min(1) });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ productIds: [] });

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return NextResponse.json({ productIds: items.map((i) => i.productId) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  await prisma.wishlist.upsert({
    where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
    update: {},
    create: { userId: session.user.id, productId: parsed.data.productId },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId wajib diisi" }, { status: 400 });

  await prisma.wishlist
    .delete({
      where: { userId_productId: { userId: session.user.id, productId } },
    })
    .catch(() => null);

  return NextResponse.json({ success: true });
}
