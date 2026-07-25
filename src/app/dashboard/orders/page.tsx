import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { ClipboardList } from "lucide-react";

export default async function OrderHistoryPage() {
  const session = await getServerSession(authOptions);

  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Belum ada order"
        description="Riwayat transaksi Anda akan muncul di sini."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <p className="font-medium text-sm">{o.orderNumber}</p>
              <p className="text-xs text-muted-2 mt-0.5">{formatDateTime(o.createdAt)}</p>
            </div>
            <Badge variant={o.status === "PAID" ? "success" : o.status === "PENDING" ? "warning" : "danger"}>
              {o.status}
            </Badge>
          </div>
          <ul className="text-sm text-muted space-y-1">
            {o.items.map((item) => (
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
              {o.payment ? `Metode: ${o.payment.method.replace("_", " ")}` : ""}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-sm">{formatRupiah(o.total)}</span>
              {o.status === "PENDING" && (
                <Link href={`/checkout/success?orderId=${o.id}`} className="text-xs text-primary-2 font-medium">
                  Lihat Instruksi
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
