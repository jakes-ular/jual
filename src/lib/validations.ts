import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter").max(150),
  shortDescription: z.string().max(200).optional(),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.coerce.number().int().min(0, "Harga tidak valid"),
  discountPrice: z.coerce.number().int().min(0).optional().nullable(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  tags: z.string().optional(),
  features: z.string().optional(),
  fileFormat: z.string().optional(),
  fileSize: z.string().optional(),
  compatibility: z.string().optional(),
  version: z.string().optional(),
  changelog: z.string().optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]).default("DRAFT"),
  isFeatured: z.coerce.boolean().default(false),
  isBestSeller: z.coerce.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(60),
  description: z.string().max(300).optional(),
  icon: z.string().max(50).optional(),
});

export const checkoutSchema = z.object({
  buyerName: z.string().min(2, "Nama wajib diisi"),
  buyerEmail: z.string().email("Email tidak valid"),
  buyerDiscord: z.string().min(2, "Username Discord wajib diisi"),
  method: z.enum(["QRIS", "GOPAY", "OVO", "DANA", "SHOPEEPAY", "BANK_TRANSFER", "VIRTUAL_ACCOUNT"]),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(80),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});
