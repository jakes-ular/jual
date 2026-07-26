import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { requireAdmin } from "./admin-guard";
import { getServerSession } from "next-auth";

describe("requireAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when there is no session", async () => {
    (getServerSession as any).mockResolvedValue(null);
    expect(await requireAdmin()).toEqual({ ok: false, status: 401, error: "Unauthorized" });
  });

  it("returns 403 when the session user isn't an admin", async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: "1", role: "USER" } });
    expect(await requireAdmin()).toEqual({ ok: false, status: 403, error: "Forbidden" });
  });

  it("returns ok with the session when the user is an admin", async () => {
    const session = { user: { id: "1", role: "ADMIN" } };
    (getServerSession as any).mockResolvedValue(session);
    expect(await requireAdmin()).toEqual({ ok: true, session });
  });
});
