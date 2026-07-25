"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { ProductCardData } from "@/types/product";

const NEW_WINDOW_DAYS = 14;

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);
  const image = product.images[0];
  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const isSale = !!product.discountPrice && product.discountPrice < product.price;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: image?.url ?? null,
      category: product.category.name,
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-2xl border border-border bg-surface overflow-hidden hover-lift flex flex-col"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-surface-2">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-2">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {product.isFeatured && <Badge variant="featured" />}
          {product.isBestSeller && <Badge variant="bestseller" />}
          {isNew && <Badge variant="new" />}
          {isSale && <Badge variant="sale" />}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-primary-2/90">
          {product.category.name}
        </span>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <RatingStars rating={product.ratingAvg} count={product.ratingCount} />

        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-bold font-display">
            {formatRupiah(product.discountPrice ?? product.price)}
          </span>
          {isSale && (
            <span className="text-xs text-muted-2 line-through">{formatRupiah(product.price)}</span>
          )}
        </div>
        {product.salesCount > 0 && (
          <span className="text-xs text-muted">{product.salesCount} terjual</span>
        )}

        <Button size="sm" className="mt-auto w-full" onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </Button>
      </div>
    </Link>
  );
}
