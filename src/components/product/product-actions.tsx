"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ShoppingCart, Zap, Minus, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCartStore } from "@/store/cart-store";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    discountPrice: number | null;
    type: string;
    category: { name: string };
  };
  image: string | null;
}

export function ProductActions({ product, image }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart(product.id));
  const isTopup = product.type === "TOPUP";
  const [qty, setQty] = useState(1);
  const [targetId, setTargetId] = useState("");
  const [serverId, setServerId] = useState("");
  const [owned, setOwned] = useState(false);
  const [checkedOwnership, setCheckedOwnership] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || isTopup) {
      setCheckedOwnership(true);
      return;
    }
    fetch("/api/me/owned-products")
      .then((r) => r.json())
      .then((data) => setOwned((data.productIds ?? []).includes(product.id)))
      .finally(() => setCheckedOwnership(true));
  }, [status, product.id, isTopup]);

  function addToCart() {
    if (isTopup && !targetId.trim()) {
      toast.error("ID Game wajib diisi");
      return false;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image,
        category: product.category.name,
        type: isTopup ? "TOPUP" : "ASSET",
        ...(isTopup ? { topupTargetId: targetId.trim(), topupServerId: serverId.trim() || undefined } : {}),
      },
      qty
    );
    toast.success(`${product.name} ditambahkan ke keranjang`);
    return true;
  }

  function buyNow() {
    if (!addToCart()) return;
    router.push("/checkout");
  }

  if (owned && checkedOwnership) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Anda sudah memiliki produk ini</p>
          <p className="text-xs text-muted mt-0.5">Unduh file dari halaman My Purchases</p>
        </div>
        <Link href="/dashboard/purchases">
          <Button size="sm" variant="secondary">
            Lihat Pembelian
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isTopup ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="targetId">ID Game</Label>
            <Input
              id="targetId"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Masukkan User ID game Anda"
              required
            />
          </div>
          <div>
            <Label htmlFor="serverId">Server / Zone ID (jika ada)</Label>
            <Input
              id="serverId"
              value={serverId}
              onChange={(e) => setServerId(e.target.value)}
              placeholder="Contoh: 2001 (khusus Mobile Legends)"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-border h-11">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-full flex items-center justify-center text-muted hover:text-foreground"
              aria-label="Kurangi jumlah"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(10, q + 1))}
              className="w-10 h-full flex items-center justify-center text-muted hover:text-foreground"
              aria-label="Tambah jumlah"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          {isInCart && <span className="text-xs text-muted">Sudah ada di keranjang</span>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" variant="secondary" className="flex-1" onClick={addToCart}>
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </Button>
        <Button size="lg" className="flex-1" onClick={buyNow}>
          <Zap className="h-4 w-4" /> Buy Now
        </Button>
      </div>
    </div>
  );
}
