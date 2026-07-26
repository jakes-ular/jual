import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn() },
    orderItem: { findFirst: vi.fn() },
    order: { create: vi.fn() },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue(true),
  clientIp: vi.fn().mockReturnValue("test-ip"),
}));
vi.mock("@/lib/discord", () => ({
  notifyNewOrder: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { notifyNewOrder } from "@/lib/discord";

const session = { user: { id: "user_1", email: "a@b.com", role: "USER" } };

const product = {
  id: "prod_1",
  name: "Vehicle Pack",
  price: 50000,
  discountPrice: null,
  status: "PUBLISHED",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

const validBody = {
  buyerName: "Budi",
  buyerEmail: "budi@example.com",
  buyerContact: "budi#1234",
  method: "QRIS" as const,
  items: [{ productId: "prod_1", quantity: 1 }],
};

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue(session);
    (prisma.product.findMany as any).mockResolvedValue([product]);
    (prisma.orderItem.findFirst as any).mockResolvedValue(null);
    (prisma.order.create as any).mockResolvedValue({
      id: "order_1",
      orderNumber: "INV-20260101-0001",
      items: [],
      payment: {},
    });
  });

  it("returns 401 when unauthenticated", async () => {
    (getServerSession as any).mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(401);
  });

  it("returns 429 when rate-limited", async () => {
    (rateLimit as any).mockReturnValueOnce(false);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(429);
  });

  it("returns 400 on an invalid payload", async () => {
    const res = await POST(makeRequest({ ...validBody, method: "PAYPAL" }));

    expect(res.status).toBe(400);
  });

  it("returns 409 when a cart product is no longer available", async () => {
    (prisma.product.findMany as any).mockResolvedValue([]);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(409);
  });

  it("returns 409 when the buyer already owns a product in the cart", async () => {
    (prisma.orderItem.findFirst as any).mockResolvedValue({
      product: { name: "Vehicle Pack" },
    });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("Vehicle Pack");
  });

  it("creates an order and notifies Discord on success", async () => {
    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.orderNumber).toBe("INV-20260101-0001");
    expect(json.instructions.referenceCode).toMatch(/^PAY[A-Z0-9]+$/);
    expect(prisma.order.create).toHaveBeenCalled();
    expect(notifyNewOrder).toHaveBeenCalledWith(
      expect.objectContaining({ orderNumber: "INV-20260101-0001", method: "QRIS" })
    );
  });
});
