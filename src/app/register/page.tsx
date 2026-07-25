import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <RegisterForm />
      </main>
      <Footer />
    </>
  );
}
