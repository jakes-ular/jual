import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
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
  title: "Topup Game",
  description: "Topup diamond, UC, dan mata uang game favorit Anda — proses cepat dan aman.",
};

interface TopupPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function TopupPage({ searchParams }: TopupPageProps) {
  const params = await searchParams;

  const categories = await prisma.category.findMany({
    where: { products: { some: { type: "TOPUP", status: "PUBLISHED" } } },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/Logo topup game.png"
              alt="Topup Game — Aman, Cepat, Terpercaya"
              width={180}
              height={180}
              className="mb-4"
              priority
            />
            <h1 className="font-display font-bold text-3xl">Topup Game</h1>
            <p className="text-sm text-muted mt-2 max-w-xl">
              Topup diamond, UC, dan mata uang game favorit Anda — pilih game, masukkan ID, dan bayar.
            </p>
          </div>

          <CatalogFilters categories={categories} />

          <Suspense fallback={<ProductGridSkeleton />} key={JSON.stringify(params)}>
            <TopupResults params={params} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

async function TopupResults({ params }: { params: Record<string, string | undefined> }) {
  const page = Number(params.page ?? "1") || 1;

  const result = await queryProducts({
    q: params.q,
    category: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as SortOption) ?? "newest",
    page,
    type: "TOPUP",
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
      <Pagination page={result.page} totalPages={result.totalPages} baseUrl="/topup" params={params} />
    </>
  );
}
