import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { topupItemSchema } from "@/lib/validations";

const createSchema = topupItemSchema.extend({
  gameId: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const game = await prisma.topupGame.findUnique({ where: { id: parsed.data.gameId } });
  if (!game) return NextResponse.json({ error: "Game tidak ditemukan" }, { status: 404 });

  const item = await prisma.topupItem.create({ data: parsed.data });
  return NextResponse.json({ item }, { status: 201 });
}
