"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Copy, Download, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface OrderData {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: { productName: string; unitPrice: number; quantity: number }[];
  payment: {
    method: string;
    status: string;
    referenceCode: string;
    expiresAt: string | null;
  } | null;
}

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    const res = await fetch(`/api/orders/${orderId}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  function copyReference() {
    if (!order?.payment) return;
    navigator.clipboard.writeText(order.payment.referenceCode);
    toast.success("Kode referensi disalin");
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
        {loading ? (
          <p className="text-center text-muted">Memuat pesanan...</p>
        ) : !order ? (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-danger mx-auto mb-4" />
            <h1 className="font-display font-bold text-2xl">Pesanan tidak ditemukan</h1>
            <Link href="/catalog" className="text-primary-2 text-sm mt-4 inline-block">
              Kembali ke katalog
            </Link>
          </div>
        ) : (
          <div className="text-center">
            {order.status === "PAID" ? (
              <CheckCircle2 className="h-14 w-14 text-success mx-auto mb-4" />
            ) : (
              <Clock className="h-14 w-14 text-warning mx-auto mb-4" />
            )}
            <h1 className="font-display font-bold text-2xl">
              {order.status === "PAID" ? "Pembayaran Berhasil!" : "Menunggu Pembayaran"}
            </h1>
            <p className="text-sm text-muted mt-2">
              No. Order <span className="font-medium text-foreground">{order.orderNumber}</span>
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm">Status Pesanan</h2>
                <Badge
                  variant={
                    order.status === "PAID"
                      ? "success"
                      : order.status === "PENDING"
                      ? "warning"
                      : "danger"
                  }
                >
                  {order.status}
                </Badge>
              </div>

              {order.status === "PENDING" && order.payment && (
                <div className="rounded-xl bg-surface-2 border border-border p-4 mb-4">
                  <p className="text-xs text-muted mb-1">Kode Referensi Pembayaran</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-lg">{order.payment.referenceCode}</span>
                    <button onClick={copyReference} className="text-muted hover:text-foreground">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-2 mt-2">
                    Sertakan kode ini saat melakukan pembayaran melalui{" "}
                    {order.payment.method.replace("_", " ")}. Admin kami akan mengonfirmasi
                    pembayaran Anda secara manual dan notifikasi otomatis telah dikirim ke tim
                    kami.
                  </p>
                  {order.payment.expiresAt && (
                    <p className="text-xs text-muted-2 mt-1">
                      Bayar sebelum {formatDateTime(order.payment.expiresAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2 text-sm">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-muted">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>{formatRupiah(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-display font-bold">
                <span>Total</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              {order.status === "PENDING" && (
                <Button variant="secondary" onClick={fetchOrder}>
                  <RefreshCw className="h-4 w-4" /> Cek Status Pembayaran
                </Button>
              )}
              <a href={`/api/orders/${order.id}/receipt`} download>
                <Button variant="outline">
                  <Download className="h-4 w-4" /> Download Resi
                </Button>
              </a>
              {order.status === "PAID" ? (
                <Link href="/dashboard/purchases">
                  <Button>Lihat Pembelian Saya</Button>
                </Link>
              ) : (
                <Link href="/dashboard/orders">
                  <Button variant="outline">Lihat Riwayat Order</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
