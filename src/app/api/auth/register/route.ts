import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { issueVerificationCode } from "@/lib/verification";

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 5 * 60 * 1000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash, role: "USER" },
    select: { id: true, name: true, email: true },
  });

  let emailSent = true;
  try {
    await issueVerificationCode(user.id, user.email, user.name);
  } catch (err) {
    console.error("Failed to send verification email during registration:", err);
    emailSent = false;
  }

  return NextResponse.json({ user, emailSent }, { status: 201 });
}
