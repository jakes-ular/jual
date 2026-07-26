import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailVerificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));
vi.mock("@/lib/email", () => ({
  sendVerificationCodeEmail: vi.fn(),
}));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed"), compare: vi.fn() },
}));

import { issueVerificationCode, verifyCode } from "./verification";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

describe("issueVerificationCode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("clears prior tokens, creates a new one, and emails the code", async () => {
    await issueVerificationCode("user_1", "a@b.com", "Budi");

    expect(prisma.emailVerificationToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_1" },
    });
    expect(prisma.emailVerificationToken.create).toHaveBeenCalled();
    expect(sendVerificationCodeEmail).toHaveBeenCalledWith("a@b.com", "Budi", expect.any(String));
  });
});

describe("verifyCode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an error when no token exists", async () => {
    (prisma.emailVerificationToken.findFirst as any).mockResolvedValue(null);
    const result = await verifyCode("user_1", "123456");
    expect(result).toEqual({ ok: false, error: "Kode tidak ditemukan. Minta kode baru." });
  });

  it("deletes and rejects an expired token", async () => {
    (prisma.emailVerificationToken.findFirst as any).mockResolvedValue({
      id: "tok_1",
      expiresAt: new Date(Date.now() - 1000),
      attempts: 0,
      codeHash: "hashed",
    });

    const result = await verifyCode("user_1", "123456");

    expect(result.ok).toBe(false);
    expect(prisma.emailVerificationToken.delete).toHaveBeenCalledWith({ where: { id: "tok_1" } });
  });

  it("deletes and rejects when max attempts exceeded", async () => {
    (prisma.emailVerificationToken.findFirst as any).mockResolvedValue({
      id: "tok_1",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 5,
      codeHash: "hashed",
    });

    const result = await verifyCode("user_1", "123456");

    expect(result.ok).toBe(false);
    expect(prisma.emailVerificationToken.delete).toHaveBeenCalledWith({ where: { id: "tok_1" } });
  });

  it("increments attempts on a wrong code", async () => {
    (prisma.emailVerificationToken.findFirst as any).mockResolvedValue({
      id: "tok_1",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 1,
      codeHash: "hashed",
    });
    (bcrypt.compare as any).mockResolvedValue(false);

    const result = await verifyCode("user_1", "000000");

    expect(result).toEqual({ ok: false, error: "Kode salah." });
    expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith({
      where: { id: "tok_1" },
      data: { attempts: { increment: 1 } },
    });
  });

  it("marks the user verified and deletes the token on a correct code", async () => {
    (prisma.emailVerificationToken.findFirst as any).mockResolvedValue({
      id: "tok_1",
      expiresAt: new Date(Date.now() + 60_000),
      attempts: 0,
      codeHash: "hashed",
    });
    (bcrypt.compare as any).mockResolvedValue(true);

    const result = await verifyCode("user_1", "123456");

    expect(result).toEqual({ ok: true });
    expect(prisma.emailVerificationToken.delete).toHaveBeenCalledWith({ where: { id: "tok_1" } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { emailVerified: expect.any(Date) },
    });
  });
});
