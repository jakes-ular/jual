import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  if (id === auth.session.user.id && parsed.data.role === "USER") {
    return NextResponse.json({ error: "Anda tidak bisa mencabut role admin Anda sendiri" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  if (id === auth.session.user.id) {
    return NextResponse.json({ error: "Anda tidak bisa menghapus akun Anda sendiri" }, { status: 400 });
  }

  const orderCount = await prisma.order.count({ where: { userId: id } });
  if (orderCount > 0) {
    return NextResponse.json(
      { error: "User tidak bisa dihapus karena memiliki riwayat order. Nonaktifkan sebagai gantinya." },
      { status: 409 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
