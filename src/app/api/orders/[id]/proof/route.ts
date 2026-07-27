import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveImageBuffer } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_PROOF_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`order-proof:${session.user.id}`, 10, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }
  if (!rateLimit(`order-proof:${clientIp(req)}`, 20, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  const order = await prisma.order.findUnique({ where: { id }, include: { payment: true } });
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!order.payment) {
    return NextResponse.json({ error: "Order ini tidak punya data pembayaran" }, { status: 409 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Order ini sudah tidak bisa diubah" }, { status: 409 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 });
  }
  if (file.size > MAX_PROOF_BYTES) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 8MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await saveImageBuffer(buffer, file.name, file.type);

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: { proofUrl: stored.url },
  });

  const updated = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true },
  });

  return NextResponse.json({ order: updated });
}
