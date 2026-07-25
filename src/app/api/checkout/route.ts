import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { getPaymentProvider } from "@/lib/payment";
import { notifyNewOrder } from "@/lib/discord";
import { formatRupiah } from "@/lib/utils";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const bodySchema = checkoutSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(10),
      })
    )
    .min(1, "Keranjang tidak boleh kosong"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Anda harus login untuk checkout" }, { status: 401 });
  }

  if (!rateLimit(`checkout:${session.user.id}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan checkout. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { items, buyerName, buyerEmail, buyerContact, method } = parsed.data;
  const productIds = items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "PUBLISHED" },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "Salah satu produk tidak lagi tersedia. Muat ulang keranjang Anda." },
      { status: 409 }
    );
  }

  const alreadyOwned = await prisma.orderItem.findFirst({
    where: { productId: { in: productIds }, order: { userId: session.user.id, status: "PAID" } },
    include: { product: { select: { name: true } } },
  });
  if (alreadyOwned) {
    return NextResponse.json(
      { error: `Anda sudah memiliki "${alreadyOwned.product.name}". Hapus dari keranjang.` },
      { status: 409 }
    );
  }

  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = product.discountPrice ?? product.price;
    return {
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItemsData.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const total = subtotal;

  const provider = getPaymentProvider();
  const orderNumber = generateOrderNumber();
  const instructions = await provider.createCharge({ method, amount: total, orderNumber });

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      buyerName,
      buyerEmail,
      buyerContact,
      subtotal,
      total,
      status: "PENDING",
      items: { create: orderItemsData },
      payment: {
        create: {
          method,
          status: "PENDING",
          amount: total,
          referenceCode: instructions.referenceCode,
          expiresAt: new Date(Date.now() + instructions.expiresInMinutes * 60 * 1000),
        },
      },
    },
    include: { items: true, payment: true },
  });

  await notifyNewOrder({
    orderNumber: order.orderNumber,
    buyerName,
    buyerEmail,
    buyerContact,
    total: formatRupiah(total),
    method,
    referenceCode: instructions.referenceCode,
    itemNames: orderItemsData.map((i) => i.productName),
  });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    instructions,
  });
}
