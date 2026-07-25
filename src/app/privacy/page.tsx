import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kebijakan privasi VoxMarket.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h1 className="font-display font-bold text-3xl mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-2 mb-10">Terakhir diperbarui: Januari 2026</p>

          <div className="space-y-8 text-sm text-muted leading-relaxed">
            <Section title="1. Data yang Kami Kumpulkan">
              Kami mengumpulkan data yang Anda berikan saat mendaftar (nama, email), melakukan
              transaksi (data pembeli, riwayat pesanan), dan data teknis (alamat IP saat
              mengunduh file untuk keperluan keamanan).
            </Section>
            <Section title="2. Penggunaan Data">
              Data Anda digunakan untuk memproses transaksi, memberikan akses ke produk digital
              yang dibeli, mengirimkan komunikasi terkait pesanan, dan meningkatkan kualitas
              layanan kami.
            </Section>
            <Section title="3. Keamanan Data">
              Password disimpan dalam bentuk hash menggunakan algoritma industri standar. Kami
              tidak pernah menyimpan data kartu pembayaran secara langsung di server kami.
            </Section>
            <Section title="4. Berbagi Data">
              Kami tidak menjual atau membagikan data pribadi Anda kepada pihak ketiga untuk
              tujuan pemasaran tanpa persetujuan Anda.
            </Section>
            <Section title="5. Cookie & Penyimpanan Lokal">
              Kami menggunakan penyimpanan lokal browser untuk menyimpan keranjang belanja Anda
              dan sesi login untuk pengalaman pengguna yang lebih baik.
            </Section>
            <Section title="6. Hak Anda">
              Anda berhak untuk mengakses, memperbarui, atau meminta penghapusan data pribadi Anda
              dengan menghubungi tim support kami.
            </Section>
            <Section title="7. Perubahan Kebijakan">
              Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan
              diinformasikan melalui email atau notifikasi di platform.
            </Section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
