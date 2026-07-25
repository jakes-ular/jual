import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hubungi tim ARK DIGITAL untuk pertanyaan, dukungan, atau kerja sama.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <ContactForm />
      <Footer />
    </>
  );
}
