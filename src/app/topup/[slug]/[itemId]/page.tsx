import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TopupPurchaseForm } from "@/components/topup/topup-purchase-form";

interface Props {
  params: Promise<{ slug: string; itemId: string }>;
}

export default async function TopupItemPage({ params }: Props) {
  const { slug, itemId } = await params;

  const item = await prisma.topupItem.findUnique({
    where: { id: itemId },
    include: { game: true },
  });

  if (!item || item.status !== "PUBLISHED" || item.game.slug !== slug || item.game.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <TopupPurchaseForm
          item={{ id: item.id, name: item.name, price: item.price }}
          game={{ name: item.game.name, slug: item.game.slug, icon: item.game.icon }}
        />
      </main>
      <Footer />
    </>
  );
}
