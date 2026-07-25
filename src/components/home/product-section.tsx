import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import type { ProductCardData } from "@/types/product";

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  viewAllHref: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl">{title}</h2>
          {subtitle && <p className="text-sm text-muted mt-1.5">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary-2 hover:text-primary-2/80 shrink-0"
        >
          Lihat Semua <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState title="Belum ada produk" description="Produk akan segera hadir di kategori ini." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <Link
        href={viewAllHref}
        className="sm:hidden mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-2"
      >
        Lihat Semua <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
