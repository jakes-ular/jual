import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Package, Wallet, Heart, ClipboardList } from "lucide-react";

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [paidOrders, totalSpent, wishlistCount, totalOrders, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId, status: "PAID" } }),
    prisma.order.aggregate({ where: { userId, status: "PAID" }, _sum: { total: true } }),
    prisma.wishlist.count({ where: { userId } }),
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);

  const stats = [
    { label: "Produk Dimiliki", value: paidOrders, icon: Package },
    { label: "Total Pengeluaran", value: formatRupiah(totalSpent._sum.total ?? 0), icon: Wallet },
    { label: "Wishlist", value: wishlistCount, icon: Heart },
    { label: "Total Order", value: totalOrders, icon: ClipboardList },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <Link href="/dashboard/orders" className="text-xs text-primary-2 font-medium">
            Lihat Semua
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted">Belum ada order.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-2">{formatDateTime(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted">{formatRupiah(o.total)}</span>
                  <Badge
                    variant={o.status === "PAID" ? "success" : o.status === "PENDING" ? "warning" : "danger"}
                  >
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
