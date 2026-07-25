import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartView } from "./cart-view";

export default function CartPage() {
  return (
    <>
      <Navbar />
      <CartView />
      <Footer />
    </>
  );
}
