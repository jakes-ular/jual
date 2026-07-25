import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signDownloadToken } from "@/lib/download-token";

export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Anda harus login untuk mengunduh" }, { status: 401 });
  }

  const file = await prisma.productFile.findUnique({
    where: { id: fileId },
    select: { id: true, productId: true },
  });
  if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

  const owns = await prisma.orderItem.findFirst({
    where: {
      productId: file.productId,
      order: { userId: session.user.id, status: "PAID" },
    },
  });
  if (!owns && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Anda belum memiliki akses ke file ini" },
      { status: 403 }
    );
  }

  const token = await signDownloadToken({ userId: session.user.id, productFileId: file.id });
  return NextResponse.json({ url: `/api/download/${token}` });
}
