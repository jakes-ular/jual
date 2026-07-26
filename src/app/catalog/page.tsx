import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { queryProducts, type SortOption } from "@/lib/products";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CatalogFilters } from "@/components/product/catalog-filters";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { NoResults } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Jelajahi katalog lengkap aset Roblox: GFX, model 3D, map, UI, script, kendaraan, pakaian, VFX, SFX, dan sistem siap pakai.",
};

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const categories = await prisma.category.findMany({
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl">Catalog</h1>
            <p className="text-sm text-muted mt-2">
              Temukan aset Roblox premium yang Anda butuhkan dari ratusan pilihan berkualitas.
            </p>
          </div>

          <CatalogFilters categories={categories} />

          <Suspense fallback={<ProductGridSkeleton />} key={JSON.stringify(params)}>
            <CatalogResults params={params} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function CatalogResults({ params }: { params: Record<string, string | undefined> }) {
  const page = Number(params.page ?? "1") || 1;
  const featuredOnly = params.featured === "1";

  const result = await queryProducts({
    q: params.q,
    category: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as SortOption) ?? "newest",
    page,
    featuredOnly,
  });

  if (result.items.length === 0) {
    return <NoResults query={params.q} />;
  }

  return (
    <>
      <p className="text-sm text-muted mb-5">
        Menampilkan {result.items.length} dari {result.total} produk
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {result.items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <Pagination page={result.page} totalPages={result.totalPages} baseUrl="/catalog" params={params} />
    </>
  );
}
