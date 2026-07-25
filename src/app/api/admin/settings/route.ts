import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rows = await prisma.setting.findMany();
  return NextResponse.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const entries = Object.entries(body as Record<string, unknown>).filter(
    ([, v]) => typeof v === "string"
  ) as [string, string][];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );

  return NextResponse.json({ success: true });
}
