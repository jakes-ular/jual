import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/states";
import { WishlistGrid } from "@/components/dashboard/wishlist-grid";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session!.user.id },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          discountPrice: true,
          category: { select: { name: true } },
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (wishlist.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Wishlist Anda kosong"
        description="Simpan produk favorit Anda untuk dibeli nanti."
        action={
          <Link href="/catalog" className="text-sm text-primary-2 font-medium">
            Jelajahi Katalog →
          </Link>
        }
      />
    );
  }

  return <WishlistGrid products={wishlist.map((w) => w.product)} />;
}
