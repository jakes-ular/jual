import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type SortOption = "newest" | "bestselling" | "price-asc" | "price-desc" | "rating";

export interface ProductQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
  perPage?: number;
  featuredOnly?: boolean;
  bestSellerOnly?: boolean;
}

const PRODUCT_CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  price: true,
  discountPrice: true,
  status: true,
  isFeatured: true,
  isBestSeller: true,
  salesCount: true,
  ratingAvg: true,
  ratingCount: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" as const }, take: 1 },
} satisfies Prisma.ProductSelect;

function sortToOrderBy(sort?: SortOption): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "bestselling":
      return { salesCount: "desc" };
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating":
      return { ratingAvg: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function queryProducts(query: ProductQuery) {
  const page = Math.max(1, query.page ?? 1);
  const perPage = query.perPage ?? 12;

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(query.featuredOnly ? { isFeatured: true } : {}),
    ...(query.bestSellerOnly ? { isBestSeller: true } : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? {
          price: {
            ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
            ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
          },
        }
      : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q } },
            { description: { contains: query.q } },
            { tags: { contains: query.q } },
            { category: { name: { contains: query.q } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy: sortToOrderBy(query.sort),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    select: PRODUCT_CARD_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getNewArrivals(limit = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: PRODUCT_CARD_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getBestSellers(limit = 8) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", isBestSeller: true },
    select: PRODUCT_CARD_SELECT,
    orderBy: { salesCount: "desc" },
    take: limit,
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 4) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", categoryId, id: { not: excludeId } },
    select: PRODUCT_CARD_SELECT,
    orderBy: { salesCount: "desc" },
    take: limit,
  });
}
