import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <LoginForm />
      </main>
      <Footer />
    </>
  );
}
