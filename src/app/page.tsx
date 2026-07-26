import { prisma } from "@/lib/prisma";
import { getFeaturedProducts, getNewArrivals, getBestSellers } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { PopularCategories } from "@/components/home/popular-categories";
import { CTA } from "@/components/home/cta";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, featured, newArrivals, bestSellers, categories] = await Promise.all([
    getSettings(),
    getFeaturedProducts(8),
    getNewArrivals(8),
    getBestSellers(8),
    prisma.category.findMany({
      where: { products: { some: { type: "ASSET", status: "PUBLISHED" } } },
      select: {
        name: true,
        slug: true,
        icon: true,
        _count: { select: { products: { where: { type: "ASSET" } } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero
          title={settings.heroTitle ?? "Premium Roblox Assets for Your Next Project"}
          subtitle={
            settings.heroSubtitle ??
            "Temukan ribuan aset Roblox berkualitas tinggi untuk mempercepat development game Anda."
          }
        />
        <ProductSection
          title="Featured Products"
          subtitle="Pilihan terbaik dari tim kurasi kami"
          products={featured}
          viewAllHref="/catalog?featured=1"
        />
        <PopularCategories categories={categories} />
        <ProductSection
          title="New Arrivals"
          subtitle="Aset terbaru yang baru saja ditambahkan"
          products={newArrivals}
          viewAllHref="/catalog?sort=newest"
        />
        <ProductSection
          title="Best Sellers"
          subtitle="Aset paling banyak dibeli oleh developer lain"
          products={bestSellers}
          viewAllHref="/catalog?sort=bestselling"
        />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
