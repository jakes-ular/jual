import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-6">Tambah Produk Baru</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
