import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  checkoutSchema,
  productSchema,
  categorySchema,
  topupCheckoutSchema,
  reviewSchema,
  profileSchema,
  passwordChangeSchema,
} from "./validations";

describe("registerSchema", () => {
  it("accepts a valid payload", () => {
    expect(
      registerSchema.safeParse({ name: "Budi", email: "budi@example.com", password: "password1" }).success
    ).toBe(true);
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(
      registerSchema.safeParse({ name: "Budi", email: "budi@example.com", password: "short" }).success
    ).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      registerSchema.safeParse({ name: "Budi", email: "not-an-email", password: "password1" }).success
    ).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(
      registerSchema.safeParse({ name: "B", email: "budi@example.com", password: "password1" }).success
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid payload", () => {
    expect(loginSchema.safeParse({ email: "budi@example.com", password: "x" }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "budi@example.com", password: "" }).success).toBe(false);
  });
});

describe("verifyEmailSchema", () => {
  it("requires exactly 6 digits", () => {
    expect(verifyEmailSchema.safeParse({ email: "a@b.com", code: "123456" }).success).toBe(true);
    expect(verifyEmailSchema.safeParse({ email: "a@b.com", code: "12345" }).success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  const base = {
    buyerName: "Budi",
    buyerEmail: "budi@example.com",
    buyerContact: "budi#1234",
  };

  it("accepts a valid payload", () => {
    expect(checkoutSchema.safeParse({ ...base, method: "QRIS" }).success).toBe(true);
  });

  it("rejects an unknown payment method", () => {
    expect(checkoutSchema.safeParse({ ...base, method: "PAYPAL" }).success).toBe(false);
  });

  it("rejects a missing buyer name", () => {
    expect(checkoutSchema.safeParse({ ...base, buyerName: undefined, method: "QRIS" }).success).toBe(false);
  });
});

describe("productSchema", () => {
  const base = {
    name: "Roblox Vehicle Pack",
    description: "A pack of vehicles for Roblox games.",
    price: 50000,
    categoryId: "cat_1",
  };

  it("accepts a valid payload and defaults status/flags", () => {
    const result = productSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("DRAFT");
      expect(result.data.isFeatured).toBe(false);
    }
  });

  it("rejects a name shorter than 3 characters", () => {
    expect(productSchema.safeParse({ ...base, name: "ab" }).success).toBe(false);
  });

  it("rejects a negative price", () => {
    expect(productSchema.safeParse({ ...base, price: -10 }).success).toBe(false);
  });

  it("coerces string price/booleans", () => {
    const result = productSchema.safeParse({ ...base, price: "50000", isFeatured: "true" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(50000);
      expect(result.data.isFeatured).toBe(true);
    }
  });
});

describe("categorySchema", () => {
  it("rejects a name shorter than 2 characters", () => {
    expect(categorySchema.safeParse({ name: "a" }).success).toBe(false);
  });
});

describe("topupCheckoutSchema", () => {
  const base = {
    topupItemId: "item_1",
    targetId: "12345678",
    buyerName: "Budi",
    buyerEmail: "budi@example.com",
    buyerContact: "budi#1234",
    method: "GOPAY" as const,
  };

  it("accepts a valid payload", () => {
    expect(topupCheckoutSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a missing targetId", () => {
    expect(topupCheckoutSchema.safeParse({ ...base, targetId: "" }).success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("rejects a rating outside 1-5", () => {
    expect(reviewSchema.safeParse({ productId: "p1", rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ productId: "p1", rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ productId: "p1", rating: 5 }).success).toBe(true);
  });
});

describe("profileSchema", () => {
  it("rejects a name shorter than 2 characters", () => {
    expect(profileSchema.safeParse({ name: "a" }).success).toBe(false);
  });
});

describe("passwordChangeSchema", () => {
  it("rejects a new password shorter than 8 characters", () => {
    expect(
      passwordChangeSchema.safeParse({ currentPassword: "old", newPassword: "short" }).success
    ).toBe(false);
  });

  it("accepts a valid payload", () => {
    expect(
      passwordChangeSchema.safeParse({ currentPassword: "old", newPassword: "newpassword1" }).success
    ).toBe(true);
  });
});
