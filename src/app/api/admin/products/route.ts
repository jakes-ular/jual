import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

const createSchema = productSchema.extend({
  images: z
    .array(z.object({ url: z.string().min(1), alt: z.string().optional() }))
    .min(1, "Minimal 1 gambar produk wajib diunggah"),
  files: z
    .array(
      z.object({
        fileName: z.string().min(1),
        storagePath: z.string().min(1),
        sizeBytes: z.number().int().min(0),
      })
    )
    .min(1, "Minimal 1 file digital wajib diunggah"),
});

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const perPage = 20;

  const where = {
    ...(q ? { name: { contains: q } } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } }, images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / perPage)) });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const { images, files, ...data } = parsed.data;
  let slug = slugify(data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      discountPrice: data.discountPrice || null,
      images: { create: images.map((img, i) => ({ url: img.url, alt: img.alt, position: i })) },
      files: { create: files },
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
