import { describe, it, expect } from "vitest";
import { getPaymentProvider, PAYMENT_METHODS, type PaymentMethod } from "./payment";

describe("getPaymentProvider", () => {
  const provider = getPaymentProvider();
  const methods = PAYMENT_METHODS.map((m) => m.value);

  it("covers all 7 payment methods", () => {
    expect(methods).toHaveLength(7);
  });

  it.each(methods)("createCharge for %s returns a well-formed instruction set", async (method: PaymentMethod) => {
    const result = await provider.createCharge({ method, amount: 75000, orderNumber: "INV-20260101-0001" });

    expect(result.referenceCode).toMatch(/^PAY[A-Z0-9]+$/);
    expect(result.expiresInMinutes).toBe(60);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps.some((s) => s.includes("75.000"))).toBe(true);
    expect(result.steps.some((s) => s.includes(result.referenceCode))).toBe(true);
  });

  it("generates a distinct reference code per charge", async () => {
    const a = await provider.createCharge({ method: "QRIS", amount: 1000, orderNumber: "INV-1" });
    const b = await provider.createCharge({ method: "QRIS", amount: 1000, orderNumber: "INV-2" });
    expect(a.referenceCode).not.toBe(b.referenceCode);
  });
});
