import { Suspense } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckoutSuccessContent } from "./success-content";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <CheckoutSuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
