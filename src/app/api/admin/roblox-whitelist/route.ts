import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { robloxWhitelistSchema } from "@/lib/validations";
import { resolveRobloxUser, getOrCreateWhitelistSecret } from "@/lib/roblox";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [entries, secret] = await Promise.all([
    prisma.robloxWhitelist.findMany({
      orderBy: { createdAt: "desc" },
      include: { sessions: { orderBy: { lastSeenAt: "desc" } } },
    }),
    getOrCreateWhitelistSecret(),
  ]);
  return NextResponse.json({ entries, secret });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = robloxWhitelistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const resolved = await resolveRobloxUser(parsed.data.robloxUsername);
  if (!resolved) {
    return NextResponse.json({ error: "Username Roblox tidak ditemukan" }, { status: 404 });
  }

  const existing = await prisma.robloxWhitelist.findUnique({
    where: { robloxUserId: String(resolved.id) },
  });
  if (existing) {
    return NextResponse.json({ error: "Akun ini sudah ada di whitelist" }, { status: 409 });
  }

  const entry = await prisma.robloxWhitelist.create({
    data: {
      robloxUsername: resolved.name,
      robloxUserId: String(resolved.id),
      note: parsed.data.note || null,
    },
  });
  return NextResponse.json({ entry }, { status: 201 });
}
