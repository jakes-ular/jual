import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { notifyNewOrder, notifyContactMessage } from "./discord";

describe("discord webhook notifications", () => {
  const originalUrl = process.env.DISCORD_WEBHOOK_URL;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.DISCORD_WEBHOOK_URL = originalUrl;
  });

  it("does not call fetch when DISCORD_WEBHOOK_URL is unset", async () => {
    delete process.env.DISCORD_WEBHOOK_URL;

    await notifyContactMessage({
      name: "Budi",
      email: "budi@example.com",
      subject: "Hi",
      message: "Test message",
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts an embed with order details when configured", async () => {
    process.env.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/test";

    await notifyNewOrder({
      orderNumber: "INV-20260101-0001",
      buyerName: "Budi",
      buyerEmail: "budi@example.com",
      buyerContact: "budi#1234",
      total: "Rp 75.000",
      method: "QRIS",
      referenceCode: "PAYABC12345",
      itemNames: ["Vehicle Pack"],
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/test",
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse((fetch as any).mock.calls[0][1].body);
    expect(body.embeds[0].fields.some((f: any) => f.value === "INV-20260101-0001")).toBe(true);
  });

  it("does not throw when the webhook request fails", async () => {
    process.env.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/test";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(
      notifyContactMessage({ name: "Budi", email: "b@x.com", subject: "Hi", message: "Test" })
    ).resolves.toBeUndefined();
  });
});
