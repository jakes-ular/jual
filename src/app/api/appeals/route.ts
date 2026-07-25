import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAppeal } from "@/lib/discord";

const appealSchema = z.object({
  message: z.string().min(10, "Pesan minimal 10 karakter").max(1000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Anda harus login" }, { status: 401 });
  }
  if (session.user.status !== "SUSPENDED") {
    return NextResponse.json({ error: "Fitur ini hanya untuk akun yang disuspend" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = appealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const existing = await prisma.appeal.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Anda sudah mengirim appeal dan sedang menunggu review admin" },
      { status: 409 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, suspensionReason: true },
  });

  const appeal = await prisma.appeal.create({
    data: { userId: session.user.id, message: parsed.data.message },
  });

  await notifyAppeal({
    buyerName: user?.name ?? "-",
    buyerEmail: user?.email ?? "-",
    suspensionReason: user?.suspensionReason ?? null,
    message: parsed.data.message,
  });

  return NextResponse.json({ appeal });
}
