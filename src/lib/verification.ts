import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Invalidates any previous code and sends a fresh one. */
export async function issueVerificationCode(userId: string, email: string, name: string) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.emailVerificationToken.deleteMany({ where: { userId } });
  await prisma.emailVerificationToken.create({
    data: { userId, codeHash, expiresAt: new Date(Date.now() + CODE_TTL_MS) },
  });

  await sendVerificationCodeEmail(email, name, code);
}

export async function verifyCode(
  userId: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!token) return { ok: false, error: "Kode tidak ditemukan. Minta kode baru." };

  if (token.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: token.id } });
    return { ok: false, error: "Kode sudah kedaluwarsa. Minta kode baru." };
  }

  if (token.attempts >= MAX_ATTEMPTS) {
    await prisma.emailVerificationToken.delete({ where: { id: token.id } });
    return { ok: false, error: "Terlalu banyak percobaan salah. Minta kode baru." };
  }

  const isValid = await bcrypt.compare(code, token.codeHash);
  if (!isValid) {
    await prisma.emailVerificationToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Kode salah." };
  }

  await prisma.emailVerificationToken.delete({ where: { id: token.id } });
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  return { ok: true };
}
