"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { TopupTabs } from "@/components/admin/topup-tabs";
import { formatRupiah, formatDateTime } from "@/lib/utils";

interface TopupOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerContact: string;
  gameName: string;
  itemName: string;
  targetId: string;
  serverId: string | null;
  price: number;
  method: string;
  referenceCode: string;
  status: string;
  proofUrl: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = ["PENDING", "PAID", "FAILED", "CANCELLED", "EXPIRED"];

export default function AdminTopupOrdersPage() {
  const [orders, setOrders] = useState<TopupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/topup/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data.items ?? []);
    setLoading(false);
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function updateStatus(order: TopupOrder, newStatus: string) {
    if (newStatus === order.status) return;
    if (newStatus === "PAID") {
      const confirmMsg = order.proofUrl
        ? `Konfirmasi pembayaran untuk order ${order.orderNumber}?`
        : `Order ${order.orderNumber} belum ada bukti pembayaran. Tetap konfirmasi PAID?`;
      if (!confirm(confirmMsg)) return;
    }

    setUpdating(order.id);
    try {
      const res = await fetch(`/api/admin/topup/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memperbarui status");
      toast.success(`Status order diperbarui menjadi ${newStatus}`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <TopupTabs />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari no. order, nama, ID game..." className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Memuat order...</p>
      ) : orders.length === 0 ? (
        <EmptyState title="Belum ada order topup" />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-medium text-sm">
                    {o.orderNumber} · {o.gameName} — {o.itemName}
                  </p>
                  <p className="text-xs text-muted-2 mt-0.5">
                    {o.buyerName} · {o.buyerEmail} · Kontak: {o.buyerContact} · {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium hidden sm:inline">{formatRupiah(o.price)}</span>
                  <Badge variant={o.status === "PAID" ? "success" : o.status === "PENDING" ? "warning" : "danger"}>
                    {o.status}
                  </Badge>
                  {expanded === o.id ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-2 mb-1">ID Game</p>
                      <p className="font-medium">
                        {o.targetId}
                        {o.serverId && ` · Server: ${o.serverId}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-2 mb-1">Bukti Pembayaran</p>
                      {o.proofUrl ? (
                        <a href={o.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                          <Image
                            src={o.proofUrl}
                            alt="Bukti pembayaran"
                            width={120}
                            height={120}
                            className="rounded-lg border border-border object-cover"
                          />
                        </a>
                      ) : (
                        <p className="text-danger text-xs">Belum diunggah</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Metode: {o.method.replace("_", " ")}</span>
                    <span>Ref: {o.referenceCode}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    <span className="text-xs text-muted mr-1">Ubah status:</span>
                    {STATUS_OPTIONS.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={s === o.status ? "secondary" : "outline"}
                        disabled={updating === o.id}
                        onClick={() => updateStatus(o, s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
