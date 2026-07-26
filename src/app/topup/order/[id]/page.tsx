import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TopupOrderStatus } from "@/components/topup/topup-order-status";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TopupOrderStatusPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <TopupOrderStatus orderId={id} />
      </main>
      <Footer />
    </>
  );
}
