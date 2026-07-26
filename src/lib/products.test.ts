import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  },
}));

import { queryProducts, getFeaturedProducts } from "./products";
import { prisma } from "@/lib/prisma";

describe("queryProducts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("always filters to PUBLISHED status", async () => {
    await queryProducts({});
    const where = (prisma.product.findMany as any).mock.calls[0][0].where;
    expect(where.status).toBe("PUBLISHED");
  });

  it.each([
    ["bestselling", { salesCount: "desc" }],
    ["price-asc", { price: "asc" }],
    ["price-desc", { price: "desc" }],
    ["rating", { ratingAvg: "desc" }],
    ["newest", { createdAt: "desc" }],
    [undefined, { createdAt: "desc" }],
  ] as const)("maps sort=%s to the right orderBy", async (sort, expected) => {
    await queryProducts({ sort });
    const orderBy = (prisma.product.findMany as any).mock.calls[0][0].orderBy;
    expect(orderBy).toEqual(expected);
  });

  it("applies category/price-range/search filters", async () => {
    await queryProducts({ category: "gfx", minPrice: 1000, maxPrice: 5000, q: "vehicle" });
    const where = (prisma.product.findMany as any).mock.calls[0][0].where;
    expect(where.category).toEqual({ slug: "gfx" });
    expect(where.price).toEqual({ gte: 1000, lte: 5000 });
    expect(where.OR).toBeDefined();
  });

  it("paginates using page/perPage", async () => {
    await queryProducts({ page: 2, perPage: 5 });
    const args = (prisma.product.findMany as any).mock.calls[0][0];
    expect(args.skip).toBe(5);
    expect(args.take).toBe(5);
  });

  it("computes totalPages from the count", async () => {
    (prisma.product.count as any).mockResolvedValueOnce(25);
    const result = await queryProducts({ perPage: 10 });
    expect(result.totalPages).toBe(3);
  });
});

describe("getFeaturedProducts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filters to published and featured products", async () => {
    await getFeaturedProducts(4);
    const args = (prisma.product.findMany as any).mock.calls[0][0];
    expect(args.where).toEqual({ status: "PUBLISHED", isFeatured: true });
    expect(args.take).toBe(4);
  });
});
