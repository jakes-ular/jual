import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, files: true },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-6">Edit Produk</h2>
      <ProductForm
        categories={categories}
        productId={product.id}
        initial={{
          name: product.name,
          shortDescription: product.shortDescription ?? "",
          description: product.description,
          price: String(product.price),
          discountPrice: product.discountPrice ? String(product.discountPrice) : "",
          categoryId: product.categoryId,
          tags: product.tags,
          features: product.features,
          fileFormat: product.fileFormat ?? "",
          fileSize: product.fileSize ?? "",
          compatibility: product.compatibility ?? "",
          version: product.version ?? "",
          changelog: product.changelog ?? "",
          status: product.status as "PUBLISHED" | "DRAFT",
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? undefined })),
          files: product.files.map((f) => ({
            fileName: f.fileName,
            storagePath: f.storagePath,
            sizeBytes: f.sizeBytes,
          })),
        }}
      />
    </div>
  );
}
