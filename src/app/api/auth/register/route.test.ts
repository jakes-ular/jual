import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(true),
  clientIp: vi.fn().mockReturnValue("test-ip"),
}));
vi.mock("@/lib/verification", () => ({
  issueVerificationCode: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed-password") },
}));

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { issueVerificationCode } from "@/lib/verification";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 429 when rate-limited", async () => {
    (rateLimit as any).mockReturnValueOnce(false);

    const res = await POST(makeRequest({ name: "Budi", email: "a@b.com", password: "password1" }));

    expect(res.status).toBe(429);
  });

  it("returns 400 on an invalid payload", async () => {
    const res = await POST(makeRequest({ name: "B", email: "not-an-email", password: "short" }));

    expect(res.status).toBe(400);
  });

  it("returns 409 when the email is already registered", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: "1", email: "a@b.com" });

    const res = await POST(makeRequest({ name: "Budi", email: "a@b.com", password: "password1" }));

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "Email sudah terdaftar" });
  });

  it("creates a user, issues a verification code, and returns 201 on success", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({ id: "1", name: "Budi", email: "a@b.com" });

    const res = await POST(makeRequest({ name: "Budi", email: "a@b.com", password: "password1" }));

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json).toEqual({ user: { id: "1", name: "Budi", email: "a@b.com" }, emailSent: true });
    expect(issueVerificationCode).toHaveBeenCalledWith("1", "a@b.com", "Budi");
  });

  it("still returns 201 with emailSent:false when verification email fails", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({ id: "1", name: "Budi", email: "a@b.com" });
    (issueVerificationCode as any).mockRejectedValueOnce(new Error("smtp down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await POST(makeRequest({ name: "Budi", email: "a@b.com", password: "password1" }));

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.emailSent).toBe(false);
  });
});
