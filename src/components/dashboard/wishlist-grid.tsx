"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Heart, ShoppingCart, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export interface WishlistProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice: number | null;
  category: { name: string };
  images: { url: string }[];
}

export function WishlistGrid({ products }: { products: WishlistProduct[] }) {
  const [items, setItems] = useState(products);
  const addItem = useCartStore((s) => s.addItem);

  async function remove(productId: string) {
    setItems((prev) => prev.filter((p) => p.id !== productId));
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
    toast.success("Dihapus dari wishlist");
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((p) => (
        <div key={p.id} className="rounded-2xl border border-border bg-surface p-4">
          <Link href={`/products/${p.slug}`} className="relative aspect-video block rounded-xl overflow-hidden bg-surface-2 mb-3">
            {p.images[0] ? (
              <Image src={p.images[0].url} alt={p.name} fill sizes="300px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-2">
                <ImageOff className="h-6 w-6" />
              </div>
            )}
          </Link>
          <Link href={`/products/${p.slug}`} className="text-sm font-medium hover:text-primary-2 line-clamp-1">
            {p.name}
          </Link>
          <p className="text-xs text-muted mt-0.5">{p.category.name}</p>
          <p className="font-display font-bold text-sm mt-2">{formatRupiah(p.discountPrice ?? p.price)}</p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                addItem({
                  productId: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.price,
                  discountPrice: p.discountPrice,
                  image: p.images[0]?.url ?? null,
                  category: p.category.name,
                });
                toast.success("Ditambahkan ke keranjang");
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
            </Button>
            <Button size="sm" variant="outline" onClick={() => remove(p.id)} aria-label="Hapus dari wishlist">
              <Heart className="h-3.5 w-3.5 fill-danger text-danger" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
