import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRelatedProducts } from "@/lib/products";
import { formatRupiah, formatBytes, formatDate } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ReviewSection } from "@/components/product/review-section";
import { ProductSection } from "@/components/home/product-section";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { FileText, HardDrive, Layers, Tag, ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      files: { select: { id: true, fileName: true, sizeBytes: true } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status !== "PUBLISHED") return { title: "Produk tidak ditemukan" };

  const image = product.images[0]?.url;
  return {
    title: product.name,
    description: product.shortDescription ?? product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? product.description.slice(0, 160),
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProduct(slug), getServerSession(authOptions)]);

  if (!product || product.status !== "PUBLISHED") notFound();

  const related = await getRelatedProducts(product.categoryId, product.id, 4, product.type as "ASSET" | "TOPUP");

  let canReview = false;
  if (session?.user) {
    const [purchased, existingReview] = await Promise.all([
      prisma.orderItem.findFirst({
        where: { productId: product.id, order: { userId: session.user.id, status: "PAID" } },
      }),
      prisma.review.findUnique({
        where: { productId_userId: { productId: product.id, userId: session.user.id } },
      }),
    ]);
    canReview = !!purchased && !existingReview;
  }

  const isSale = !!product.discountPrice && product.discountPrice < product.price;
  const features = product.features.split("\n").filter(Boolean);
  const totalFileSize = product.files.reduce((sum, f) => sum + f.sizeBytes, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    category: product.category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.discountPrice ?? product.price,
      availability: "https://schema.org/InStock",
    },
    aggregateRating:
      product.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
          }
        : undefined,
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid lg:grid-cols-2 gap-10">
            <ProductGallery images={product.images} productName={product.name} />

            <div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {product.isFeatured && <Badge variant="featured" />}
                {product.isBestSeller && <Badge variant="bestseller" />}
                {isSale && <Badge variant="sale" />}
              </div>

              <span className="text-xs font-medium uppercase tracking-wide text-primary-2">
                {product.category.name}
              </span>
              <h1 className="font-display font-bold text-2xl sm:text-3xl mt-1.5">{product.name}</h1>

              <div className="flex items-center gap-3 mt-3">
                <RatingStars rating={product.ratingAvg} count={product.ratingCount} showValue />
                {product.salesCount > 0 && (
                  <span className="text-xs text-muted">· {product.salesCount} terjual</span>
                )}
              </div>

              <div className="flex items-baseline gap-3 mt-5">
                <span className="font-display font-extrabold text-3xl">
                  {formatRupiah(product.discountPrice ?? product.price)}
                </span>
                {isSale && (
                  <span className="text-base text-muted-2 line-through">
                    {formatRupiah(product.price)}
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-sm text-muted mt-4 leading-relaxed">{product.shortDescription}</p>
              )}

              <div className="mt-6 flex items-start gap-3">
                <div className="flex-1">
                  <ProductActions
                    product={{
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      discountPrice: product.discountPrice,
                      type: product.type,
                      category: { name: product.category.name },
                    }}
                    image={product.images[0]?.url ?? null}
                  />
                </div>
                <WishlistButton productId={product.id} />
              </div>

              {product.type === "ASSET" && (
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <InfoBox icon={FileText} label="Format File" value={product.fileFormat ?? "-"} />
                  <InfoBox icon={HardDrive} label="Ukuran File" value={product.fileSize ?? formatBytes(totalFileSize)} />
                  <InfoBox icon={Layers} label="Kompatibilitas" value={product.compatibility ?? "-"} />
                  <InfoBox icon={Tag} label="Versi" value={product.version ?? "-"} />
                </div>
              )}

              <div className="mt-6 flex items-center gap-2 text-xs text-muted rounded-lg border border-border p-3">
                <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                {product.type === "TOPUP"
                  ? "Topup diproses manual oleh admin ke ID Game Anda setelah pembayaran dikonfirmasi."
                  : "Akses download aman dikirim otomatis setelah pembayaran dikonfirmasi."}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 mt-16">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="font-display font-bold text-xl mb-4">Deskripsi Produk</h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </section>

              {features.length > 0 && (
                <section>
                  <h2 className="font-display font-bold text-xl mb-4">Fitur Produk</h2>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-2 mt-1.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {product.changelog && (
                <section>
                  <h2 className="font-display font-bold text-xl mb-4">Changelog</h2>
                  <p className="text-sm text-muted leading-relaxed">{product.changelog}</p>
                </section>
              )}

              <section>
                <h2 className="font-display font-bold text-xl mb-4">
                  Review ({product.ratingCount})
                </h2>
                <ReviewSection
                  productId={product.id}
                  canReview={canReview}
                  reviews={product.reviews.map((r) => ({
                    ...r,
                    createdAt: r.createdAt.toISOString(),
                  }))}
                />
              </section>
            </div>

            <aside className="rounded-2xl border border-border bg-surface p-5 h-fit">
              {product.type === "ASSET" && (
                <>
                  <h3 className="font-semibold text-sm mb-3">Informasi File</h3>
                  <ul className="space-y-2.5 text-sm">
                    {product.files.map((f) => (
                      <li key={f.id} className="flex items-center justify-between gap-2">
                        <span className="text-muted truncate">{f.fileName}</span>
                        <span className="text-muted-2 text-xs shrink-0">{formatBytes(f.sizeBytes)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className={product.type === "ASSET" ? "mt-4 pt-4 border-t border-border text-xs text-muted-2" : "text-xs text-muted-2"}>
                Ditambahkan {formatDate(product.createdAt)}
              </div>
            </aside>
          </div>
        </div>

        {related.length > 0 && (
          <ProductSection
            title="Produk Terkait"
            products={related}
            viewAllHref={`/catalog?category=${product.category.slug}`}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-2 text-[11px] uppercase tracking-wide mb-1">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}
