"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, ImageOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { formatRupiah } from "@/lib/utils";
import { useCartStore, cartItemPrice, cartTotal } from "@/store/cart-store";

export function CartView() {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/me/owned-products")
      .then((r) => r.json())
      .then((data) => setOwnedIds(data.productIds ?? []));
  }, [status]);

  const ownedInCart = items.filter((i) => ownedIds.includes(i.productId));
  const total = cartTotal(items);

  function handleCheckout() {
    if (ownedInCart.length > 0) {
      toast.error("Hapus produk yang sudah Anda miliki sebelum checkout");
      return;
    }
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    router.push("/checkout");
  }

  if (!mounted) return null;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="font-display font-bold text-3xl mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Keranjang Anda kosong"
            description="Jelajahi katalog kami dan temukan aset Roblox yang Anda butuhkan."
            action={
              <Link href="/catalog">
                <Button>Jelajahi Katalog</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const owned = ownedIds.includes(item.productId);
                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-surface-2"
                    >
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-2">
                          <ImageOff className="h-6 w-6" />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`} className="font-medium text-sm hover:text-primary-2 line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted mt-0.5">{item.category}</p>

                      {owned && (
                        <p className="flex items-center gap-1 text-xs text-warning mt-1.5">
                          <AlertTriangle className="h-3 w-3" /> Anda sudah memiliki produk ini
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center rounded-lg border border-border h-8">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center text-muted hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-muted hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-display font-bold text-sm">
                          {formatRupiah(cartItemPrice(item) * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10"
                      aria-label="Hapus dari keranjang"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 h-fit sticky top-24">
              <h2 className="font-semibold text-sm mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} item)</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-display font-bold">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <Button className="w-full mt-5" size="lg" onClick={handleCheckout}>
                Checkout
              </Button>
              {status !== "authenticated" && (
                <p className="text-xs text-muted-2 text-center mt-2.5">
                  Anda perlu login untuk melanjutkan checkout
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
