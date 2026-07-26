import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    setting: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { getSettings, getSetting } from "./settings";
import { prisma } from "@/lib/prisma";

describe("getSettings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps rows into a key/value record", async () => {
    (prisma.setting.findMany as any).mockResolvedValue([
      { key: "site_name", value: "VoxMarket" },
      { key: "contact_email", value: "hi@voxmarket.dev" },
    ]);

    expect(await getSettings()).toEqual({
      site_name: "VoxMarket",
      contact_email: "hi@voxmarket.dev",
    });
  });
});

describe("getSetting", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the row's value when found", async () => {
    (prisma.setting.findUnique as any).mockResolvedValue({ key: "site_name", value: "VoxMarket" });
    expect(await getSetting("site_name")).toBe("VoxMarket");
  });

  it("returns the fallback when not found", async () => {
    (prisma.setting.findUnique as any).mockResolvedValue(null);
    expect(await getSetting("missing", "default")).toBe("default");
  });

  it("defaults the fallback to an empty string", async () => {
    (prisma.setting.findUnique as any).mockResolvedValue(null);
    expect(await getSetting("missing")).toBe("");
  });
});
