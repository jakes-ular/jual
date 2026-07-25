import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ClipboardList, Package, Users, Clock } from "lucide-react";

export default async function AdminOverviewPage() {
  const [revenue, totalOrders, pendingOrders, totalProducts, totalUsers, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
    ]);

  const stats = [
    { label: "Total Revenue", value: formatRupiah(revenue._sum.total ?? 0), icon: DollarSign },
    { label: "Total Orders", value: totalOrders, icon: ClipboardList },
    { label: "Pending Orders", value: pendingOrders, icon: Clock },
    { label: "Total Products", value: totalProducts, icon: Package },
    { label: "Total Users", value: totalUsers, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className="h-9 w-9 rounded-lg bg-gradient-brand/15 flex items-center justify-center text-primary-2 mb-3">
              <s.icon className="h-4.5 w-4.5" />
            </div>
            <p className="font-display font-bold text-xl">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Order Terbaru</h2>
          <Link href="/admin/orders" className="text-xs text-primary-2 font-medium">
            Lihat Semua
          </Link>
        </div>
        <div className="space-y-3">
          {recentOrders.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-xs text-muted-2">
                  {o.buyerName} · {formatDateTime(o.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted">{formatRupiah(o.total)}</span>
                <Badge variant={o.status === "PAID" ? "success" : o.status === "PENDING" ? "warning" : "danger"}>
                  {o.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
