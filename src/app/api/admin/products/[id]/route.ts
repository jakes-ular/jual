import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { deleteStoredFile } from "@/lib/storage";

const updateSchema = productSchema.extend({
  images: z.array(z.object({ url: z.string().min(1), alt: z.string().optional() })).min(1),
  files: z
    .array(
      z.object({
        fileName: z.string().min(1),
        storagePath: z.string().min(1),
        sizeBytes: z.number().int().min(0),
      })
    )
    .min(1),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      files: true,
    },
  });
  if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { images: true, files: true },
  });
  if (!existing) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

  const { images, files, ...data } = parsed.data;

  // remove images/files no longer referenced, then replace with the submitted set
  const keptImageUrls = new Set(images.map((i) => i.url));
  const keptFilePaths = new Set(files.map((f) => f.storagePath));

  for (const img of existing.images) {
    if (!keptImageUrls.has(img.url)) {
      const storagePath = img.url.replace(/^\/uploads\//, "");
      await deleteStoredFile(storagePath);
    }
  }
  for (const f of existing.files) {
    if (!keptFilePaths.has(f.storagePath)) {
      await deleteStoredFile(f.storagePath);
    }
  }

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productFile.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        ...data,
        discountPrice: data.discountPrice || null,
        images: { create: images.map((img, i) => ({ url: img.url, alt: img.alt, position: i })) },
        files: { create: files },
      },
    }),
  ]);

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, images: true, files: true },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, files: true },
  });
  if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

  const hasOrders = await prisma.orderItem.findFirst({ where: { productId: id } });
  if (hasOrders) {
    return NextResponse.json(
      { error: "Produk tidak bisa dihapus karena sudah memiliki riwayat transaksi. Ubah ke Draft sebagai gantinya." },
      { status: 409 }
    );
  }

  for (const img of product.images) {
    await deleteStoredFile(img.url.replace(/^\/uploads\//, ""));
  }
  for (const f of product.files) {
    await deleteStoredFile(f.storagePath);
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
