import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/states";
import { DownloadButton } from "@/components/dashboard/download-button";
import { PackageOpen } from "lucide-react";

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions);

  const items = await prisma.orderItem.findMany({
    where: { order: { userId: session!.user.id, status: "PAID" } },
    include: {
      order: { select: { orderNumber: true, paidAt: true, createdAt: true } },
      product: {
        select: {
          slug: true,
          name: true,
          images: { take: 1, orderBy: { position: "asc" } },
          files: { select: { id: true, fileName: true } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Belum ada pembelian"
        description="Produk yang Anda beli akan muncul di sini beserta akses download."
        action={
          <Link href="/catalog" className="text-sm text-primary-2 font-medium">
            Jelajahi Katalog →
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-surface p-4">
          {item.product ? (
            <>
              <Link
                href={`/products/${item.product.slug}`}
                className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-surface-2"
              >
                {item.product.images[0] ? (
                  <Image src={item.product.images[0].url} alt={item.product.name} fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-2">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`} className="font-medium text-sm hover:text-primary-2">
                  {item.product.name}
                </Link>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted">
                  <span>No. Order: {item.order.orderNumber}</span>
                  <span>
                    Dibeli {formatDate(item.order.paidAt ?? item.order.createdAt)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.product.files.map((f) => (
                    <DownloadButton key={f.id} fileId={f.id} label={f.fileName} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.productName}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted">
                <span>No. Order: {item.order.orderNumber}</span>
                <span>Dibeli {formatDate(item.order.paidAt ?? item.order.createdAt)}</span>
              </div>
              <p className="text-xs text-muted-2 mt-3">Produk ini sudah tidak tersedia.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
