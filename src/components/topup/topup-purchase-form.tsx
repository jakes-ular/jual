"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment";

interface Props {
  item: { id: string; name: string; price: number };
  game: { name: string; slug: string; icon: string | null };
}

export function TopupPurchaseForm({ item, game }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [targetId, setTargetId] = useState("");
  const [serverId, setServerId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/topup/${game.slug}/${item.id}`);
    }
  }, [status, router, game.slug, item.id]);

  useEffect(() => {
    if (!session?.user) return;
    Promise.resolve().then(() => {
      setBuyerName(session.user.name ?? "");
      setBuyerEmail(session.user.email ?? "");
    });
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!targetId.trim() || !buyerName.trim() || !buyerEmail.trim() || !buyerContact.trim()) {
      setError("Semua data wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/topup/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topupItemId: item.id,
          targetId,
          serverId: serverId || undefined,
          buyerName,
          buyerEmail,
          buyerContact,
          method,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat pesanan");

      router.push(`/topup/order/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Link href={`/topup/${game.slug}`} className="text-sm text-muted hover:text-foreground">
        ← Kembali ke {game.name}
      </Link>

      <div className="flex items-center gap-4 mt-4 mb-8">
        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-surface-2 shrink-0">
          {game.icon ? (
            <Image src={game.icon} alt={game.name} fill sizes="56px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-2">
              <Gamepad2 className="h-6 w-6" />
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">{game.name}</p>
          <h1 className="font-display font-bold text-2xl">{item.name}</h1>
          <p className="font-display font-bold text-primary-2 text-lg">{formatRupiah(item.price)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
            <h2 className="font-semibold text-sm">Data Akun Game</h2>
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
                placeholder="Contoh: 2001"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
            <h2 className="font-semibold text-sm">Data Pembeli</h2>
            <div>
              <Label htmlFor="buyerName">Nama Lengkap</Label>
              <Input id="buyerName" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="buyerEmail">Email</Label>
              <Input id="buyerEmail" type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="buyerContact">Username Discord / No. WhatsApp</Label>
              <Input
                id="buyerContact"
                placeholder="contoh: namamu#0000 atau 08123456789"
                value={buyerContact}
                onChange={(e) => setBuyerContact(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold text-sm mb-4">Metode Pembayaran</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                    method === m.value ? "border-primary bg-primary/5" : "border-border hover:border-border-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    className="accent-[var(--primary)]"
                  />
                  <div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted-2">{m.group}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 h-fit sticky top-24">
          <h2 className="font-semibold text-sm mb-4">Ringkasan</h2>
          <div className="space-y-2.5 text-sm text-muted">
            <div className="flex justify-between">
              <span>{item.name}</span>
              <span>{formatRupiah(item.price)}</span>
            </div>
          </div>
          <div className="border-t border-border mt-4 pt-4 flex justify-between font-display font-bold">
            <span>Total</span>
            <span>{formatRupiah(item.price)}</span>
          </div>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" className="w-full mt-5" size="lg" loading={submitting}>
            Lanjut Bayar
          </Button>
        </div>
      </form>
    </div>
  );
}
