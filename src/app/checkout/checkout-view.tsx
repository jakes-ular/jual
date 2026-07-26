"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { formatRupiah } from "@/lib/utils";
import { useCartStore, cartItemPrice, cartTotal } from "@/store/cart-store";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment";

export function CheckoutView() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerContact, setBuyerDiscord] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/checkout");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setBuyerName(session.user.name ?? "");
      setBuyerEmail(session.user.email ?? "");
    }
  }, [session]);

  const total = cartTotal(items);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!buyerName.trim() || !buyerEmail.trim() || !buyerContact.trim()) {
      setError("Nama, email, dan Discord/WhatsApp wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerEmail,
          buyerContact,
          method,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            topupTargetId: i.topupTargetId,
            topupServerId: i.topupServerId,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat pesanan");

      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || status === "loading") return null;

  if (items.length === 0) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
          <EmptyState
            title="Keranjang kosong"
            description="Tambahkan produk ke keranjang sebelum checkout."
            action={
              <Link href="/catalog">
                <Button>Jelajahi Katalog</Button>
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-semibold text-sm mb-4">Data Pembeli</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buyerName">Nama Lengkap</Label>
                  <Input
                    id="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buyerEmail">Email</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buyerContact">Username Discord / No. WhatsApp</Label>
                  <Input
                    id="buyerContact"
                    placeholder="contoh: namamu#0000 atau 08123456789"
                    value={buyerContact}
                    onChange={(e) => setBuyerDiscord(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-semibold text-sm mb-4">Metode Pembayaran</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      method === m.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      checked={method === m.value}
                      onChange={() => setMethod(m.value)}
                      className="accent-[#8b5cf6]"
                    />
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted-2">{m.group}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-semibold text-sm mb-4">Produk Dipesan</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-surface-2">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-2">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      {item.type === "TOPUP" && item.topupTargetId ? (
                        <p className="text-xs text-muted">
                          ID Game: {item.topupTargetId}
                          {item.topupServerId && ` · Server: ${item.topupServerId}`}
                        </p>
                      ) : (
                        <p className="text-xs text-muted">Qty {item.quantity}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {formatRupiah(cartItemPrice(item) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 h-fit sticky top-24">
            <h2 className="font-semibold text-sm mb-4">Ringkasan Transaksi</h2>
            <div className="space-y-2.5 text-sm text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-display font-bold">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>

            {error && <FieldError>{error}</FieldError>}

            <Button type="submit" className="w-full mt-5" size="lg" loading={submitting}>
              Buat Pesanan
            </Button>

            <div className="flex items-center gap-2 mt-4 text-xs text-muted-2">
              <ShieldCheck className="h-4 w-4 text-success shrink-0" />
              Pembayaran dikonfirmasi manual oleh admin dan biasanya diproses dalam hitungan menit.
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
