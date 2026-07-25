import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { readStoredFile } from "@/lib/storage";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = await verifyDownloadToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Link download tidak valid atau sudah kedaluwarsa" }, { status: 401 });
  }

  const file = await prisma.productFile.findUnique({ where: { id: payload.productFileId } });
  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

  const owns = await prisma.orderItem.findFirst({
    where: { productId: file.productId, order: { userId: payload.userId, status: "PAID" } },
  });
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!owns && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  let buffer: Buffer;
  try {
    buffer = await readStoredFile(file.storagePath);
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan di server" }, { status: 404 });
  }

  await prisma.download.create({
    data: {
      userId: payload.userId,
      productFileId: file.id,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Content-Length": String(buffer.byteLength),
    },
  });
}
