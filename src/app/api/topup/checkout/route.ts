import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { topupCheckoutSchema } from "@/lib/validations";
import { generateOrderNumber, formatRupiah } from "@/lib/utils";
import { getPaymentProvider } from "@/lib/payment";
import { notifyNewTopupOrder } from "@/lib/discord";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Anda harus login untuk topup" }, { status: 401 });
  }

  if (!rateLimit(`topup-checkout:${session.user.id}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = topupCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { topupItemId, targetId, serverId, buyerName, buyerEmail, buyerContact, method } = parsed.data;

  const item = await prisma.topupItem.findUnique({
    where: { id: topupItemId },
    include: { game: true },
  });
  if (!item || item.status !== "PUBLISHED" || item.game.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Item topup tidak lagi tersedia" }, { status: 409 });
  }

  const provider = getPaymentProvider();
  const orderNumber = generateOrderNumber();
  const instructions = await provider.createCharge({ method, amount: item.price, orderNumber });

  const order = await prisma.topupOrder.create({
    data: {
      orderNumber,
      userId: session.user.id,
      topupItemId: item.id,
      gameName: item.game.name,
      itemName: item.name,
      price: item.price,
      targetId,
      serverId: serverId || null,
      buyerName,
      buyerEmail,
      buyerContact,
      method,
      referenceCode: instructions.referenceCode,
      status: "PENDING",
      expiresAt: new Date(Date.now() + instructions.expiresInMinutes * 60 * 1000),
    },
  });

  await notifyNewTopupOrder({
    orderNumber: order.orderNumber,
    buyerName,
    buyerEmail,
    buyerContact,
    gameName: item.game.name,
    itemName: item.name,
    targetId,
    serverId: serverId || null,
    total: formatRupiah(item.price),
    method,
    referenceCode: instructions.referenceCode,
  });

  return NextResponse.json({ orderId: order.id });
}
