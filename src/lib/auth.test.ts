import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authorize = authOptions.providers[0].options.authorize!;

describe("authOptions.providers[0].authorize", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws when credentials are missing", async () => {
    await expect(authorize(undefined, undefined as never)).rejects.toThrow(
      "Email dan password wajib diisi"
    );
  });

  it("throws a generic error when the user doesn't exist", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    await expect(
      authorize({ email: "a@b.com", password: "x" }, undefined as never)
    ).rejects.toThrow("Email atau password salah");
  });

  it("throws a generic error when the password is wrong", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      passwordHash: "hash",
      emailVerified: new Date(),
    });
    (bcrypt.compare as any).mockResolvedValue(false);

    await expect(
      authorize({ email: "a@b.com", password: "wrong" }, undefined as never)
    ).rejects.toThrow("Email atau password salah");
  });

  it("throws EMAIL_NOT_VERIFIED when the account hasn't verified email", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      passwordHash: "hash",
      emailVerified: null,
    });
    (bcrypt.compare as any).mockResolvedValue(true);

    await expect(
      authorize({ email: "a@b.com", password: "correct" }, undefined as never)
    ).rejects.toThrow("EMAIL_NOT_VERIFIED");
  });

  it("returns the user shape and touches lastLoginAt on success", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "1",
      name: "Budi",
      email: "a@b.com",
      role: "USER",
      status: "ACTIVE",
      avatarUrl: null,
      passwordHash: "hash",
      emailVerified: new Date(),
    });
    (bcrypt.compare as any).mockResolvedValue(true);

    const result = await authorize({ email: "a@b.com", password: "correct" }, undefined as never);

    expect(result).toEqual({
      id: "1",
      name: "Budi",
      email: "a@b.com",
      role: "USER",
      status: "ACTIVE",
      image: undefined,
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { lastLoginAt: expect.any(Date) },
    });
  });
});

describe("authOptions.callbacks.jwt", () => {
  beforeEach(() => vi.clearAllMocks());

  it("copies id/role/status from user onto the token on sign-in", async () => {
    const token = await authOptions.callbacks!.jwt!({
      token: {},
      user: { id: "1", role: "ADMIN", status: "ACTIVE" } as any,
    } as any);

    expect(token).toMatchObject({ id: "1", role: "ADMIN", status: "ACTIVE" });
  });

  it("re-fetches role/status from the DB on subsequent requests", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ role: "USER", status: "SUSPENDED" });

    const token = await authOptions.callbacks!.jwt!({
      token: { id: "1", role: "ADMIN", status: "ACTIVE" },
      user: undefined,
    } as any);

    expect(token.role).toBe("USER");
    expect(token.status).toBe("SUSPENDED");
  });
});

describe("authOptions.callbacks.session", () => {
  it("copies id/role/status from the token onto session.user", async () => {
    const session = await authOptions.callbacks!.session!({
      session: { user: {} } as any,
      token: { id: "1", role: "ADMIN", status: "ACTIVE" },
    } as any);

    expect(session.user).toMatchObject({ id: "1", role: "ADMIN", status: "ACTIVE" });
  });
});
