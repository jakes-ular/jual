import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { ClipboardList, Download } from "lucide-react";

export default async function OrderHistoryPage() {
  const session = await getServerSession(authOptions);

  const [orders, topupOrders] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session!.user.id },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.topupOrder.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (orders.length === 0 && topupOrders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Belum ada order"
        description="Riwayat transaksi Anda akan muncul di sini."
      />
    );
  }

  const entries = [
    ...orders.map((o) => ({ type: "asset" as const, createdAt: o.createdAt, order: o })),
    ...topupOrders.map((o) => ({ type: "topup" as const, createdAt: o.createdAt, order: o })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-4">
      {entries.map((entry) =>
        entry.type === "asset" ? (
          <div key={entry.order.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <p className="font-medium text-sm">{entry.order.orderNumber}</p>
                <p className="text-xs text-muted-2 mt-0.5">{formatDateTime(entry.order.createdAt)}</p>
              </div>
              <Badge
                variant={
                  entry.order.status === "PAID" ? "success" : entry.order.status === "PENDING" ? "warning" : "danger"
                }
              >
                {entry.order.status}
              </Badge>
            </div>
            <ul className="text-sm text-muted space-y-1">
              {entry.order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.productName} x{item.quantity}
                  </span>
                  <span>{formatRupiah(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border mt-3 pt-3">
              <span className="text-xs text-muted">
                {entry.order.payment ? `Metode: ${entry.order.payment.method.replace("_", " ")}` : ""}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-sm">{formatRupiah(entry.order.total)}</span>
                <a
                  href={`/api/orders/${entry.order.id}/receipt`}
                  download
                  className="text-xs text-primary-2 font-medium inline-flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> Resi
                </a>
                {entry.order.status === "PENDING" && (
                  <Link href={`/checkout/success?orderId=${entry.order.id}`} className="text-xs text-primary-2 font-medium">
                    Lihat Instruksi
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div key={entry.order.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <p className="font-medium text-sm">
                  {entry.order.orderNumber} <span className="text-muted-2 font-normal">· Topup</span>
                </p>
                <p className="text-xs text-muted-2 mt-0.5">{formatDateTime(entry.order.createdAt)}</p>
              </div>
              <Badge
                variant={
                  entry.order.status === "PAID" ? "success" : entry.order.status === "PENDING" ? "warning" : "danger"
                }
              >
                {entry.order.status}
              </Badge>
            </div>
            <p className="text-sm text-muted">
              {entry.order.gameName} — {entry.order.itemName}
            </p>
            <p className="text-xs text-muted-2 mt-1">
              ID Game: {entry.order.targetId}
              {entry.order.serverId && ` · Server: ${entry.order.serverId}`}
            </p>
            <div className="flex items-center justify-between border-t border-border mt-3 pt-3">
              <span className="text-xs text-muted">Metode: {entry.order.method.replace("_", " ")}</span>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-sm">{formatRupiah(entry.order.price)}</span>
                {entry.order.status === "PENDING" && (
                  <Link href={`/topup/order/${entry.order.id}`} className="text-xs text-primary-2 font-medium">
                    Lihat Instruksi
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
