import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Syarat dan ketentuan penggunaan VoxMarket.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h1 className="font-display font-bold text-3xl mb-2">Terms & Conditions</h1>
          <p className="text-sm text-muted-2 mb-10">Terakhir diperbarui: Januari 2026</p>

          <div className="prose-legal space-y-8 text-sm text-muted leading-relaxed">
            <Section title="1. Penerimaan Ketentuan">
              Dengan mengakses dan menggunakan VoxMarket, Anda menyetujui untuk terikat oleh syarat
              dan ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak
              menggunakan layanan kami.
            </Section>
            <Section title="2. Lisensi Aset Digital">
              Setiap pembelian aset digital di VoxMarket memberikan Anda lisensi penggunaan pribadi
              atau komersial sesuai dengan yang tercantum pada halaman produk. Aset tidak boleh
              dijual kembali, didistribusikan ulang, atau dibagikan tanpa izin tertulis dari
              kreator.
            </Section>
            <Section title="3. Pembayaran">
              Pembayaran dilakukan melalui metode yang tersedia di halaman checkout. Pesanan akan
              diproses setelah pembayaran dikonfirmasi oleh tim kami. Waktu konfirmasi dapat
              bervariasi tergantung metode pembayaran yang dipilih.
            </Section>
            <Section title="4. Kebijakan Refund">
              Karena sifat produk digital yang dapat langsung diunduh, pada dasarnya kami tidak
              menyediakan refund kecuali terdapat kesalahan signifikan pada produk yang menjadi
              tanggung jawab penjual.
            </Section>
            <Section title="5. Akun Pengguna">
              Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. VoxMarket
              berhak menangguhkan akun yang terindikasi melakukan pelanggaran ketentuan layanan.
            </Section>
            <Section title="6. Batasan Tanggung Jawab">
              VoxMarket tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari
              penggunaan aset yang dibeli melalui platform kami.
            </Section>
            <Section title="7. Perubahan Ketentuan">
              Kami dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan
              diinformasikan melalui halaman ini.
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
