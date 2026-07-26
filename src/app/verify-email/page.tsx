import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { VerifyEmailForm } from "./verify-email-form";

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <VerifyEmailForm />
      </main>
      <Footer />
    </>
  );
}
