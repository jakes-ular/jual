import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckoutView } from "./checkout-view";

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <CheckoutView />
      <Footer />
    </>
  );
}
