import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { topupGameSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const games = await prisma.topupGame.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ games });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = topupGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  let slug = slugify(parsed.data.name);
  const existing = await prisma.topupGame.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const game = await prisma.topupGame.create({ data: { ...parsed.data, slug } });
  return NextResponse.json({ game }, { status: 201 });
}
