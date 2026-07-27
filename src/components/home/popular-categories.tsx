import Link from "next/link";
import { CategoryIcon } from "@/components/product/category-icon";
import { Reveal } from "@/components/ui/reveal";

interface CategoryWithCount {
  name: string;
  slug: string;
  icon: string | null;
  _count: { products: number };
}

export function PopularCategories({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <div className="mb-8">
        <h2 className="font-display font-bold text-2xl sm:text-3xl">Popular Categories</h2>
        <p className="text-sm text-muted mt-1.5">
          Jelajahi aset Roblox berdasarkan kategori favorit developer
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 60} className="h-full">
            <Link
              href={`/catalog?category=${c.slug}`}
              className="group h-full rounded-2xl border border-border bg-surface p-5 hover-lift flex flex-col items-start gap-3"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-2 group-hover:bg-gradient-brand group-hover:text-white transition-colors">
                <CategoryIcon name={c.icon} className="h-5 w-5 icon-pop" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{c.name}</h3>
                <p className="text-xs text-muted mt-0.5">{c._count.products} produk</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
