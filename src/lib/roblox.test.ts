import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    setting: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { getOrCreateWhitelistSecret, regenerateWhitelistSecret, resolveRobloxUser } from "./roblox";
import { prisma } from "@/lib/prisma";

describe("getOrCreateWhitelistSecret", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the existing secret without writing when one is already stored", async () => {
    (prisma.setting.findUnique as any).mockResolvedValue({ key: "robloxWhitelistSecret", value: "existing-secret" });

    expect(await getOrCreateWhitelistSecret()).toBe("existing-secret");
    expect(prisma.setting.upsert).not.toHaveBeenCalled();
  });

  it("seeds the fixed initial secret when none is stored yet", async () => {
    (prisma.setting.findUnique as any).mockResolvedValue(null);

    const secret = await getOrCreateWhitelistSecret();

    expect(secret).toMatch(/^[0-9a-f]{64}$/);
    expect(prisma.setting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: { key: "robloxWhitelistSecret", value: secret } })
    );
  });
});

describe("regenerateWhitelistSecret", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes and returns a freshly generated secret", async () => {
    const secret = await regenerateWhitelistSecret();

    expect(secret).toMatch(/^[0-9a-f]{64}$/);
    expect(prisma.setting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { value: secret } })
    );
  });
});

describe("resolveRobloxUser", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("returns the resolved id/name on a successful lookup", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 123456, name: "BuilderMan" }] }),
    });

    expect(await resolveRobloxUser("BuilderMan")).toEqual({ id: 123456, name: "BuilderMan" });
  });

  it("returns null when the Roblox API call fails", async () => {
    (fetch as any).mockResolvedValue({ ok: false });
    expect(await resolveRobloxUser("nobody")).toBeNull();
  });

  it("returns null when no user matches", async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    expect(await resolveRobloxUser("nobody")).toBeNull();
  });
});
