import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sparkles, ShieldCheck, Zap, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Kenali ARK DIGITAL, marketplace aset Roblox premium untuk developer.",
};

const values = [
  {
    icon: Sparkles,
    title: "Kualitas Terkurasi",
    description: "Setiap aset melalui proses kurasi untuk memastikan kualitas premium.",
  },
  {
    icon: ShieldCheck,
    title: "Transaksi Aman",
    description: "Sistem pembayaran dan pengiriman file digital yang aman dan terverifikasi.",
  },
  {
    icon: Zap,
    title: "Akses Instan",
    description: "Download aset langsung setelah pembayaran dikonfirmasi, tanpa menunggu lama.",
  },
  {
    icon: Users,
    title: "Komunitas Developer",
    description: "Dibangun oleh dan untuk komunitas developer Roblox Indonesia.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-center">
            Tentang <span className="text-gradient">ARK DIGITAL</span>
          </h1>
          <p className="text-muted text-center mt-4 max-w-2xl mx-auto leading-relaxed">
            ARK DIGITAL adalah marketplace aset Roblox premium yang menghubungkan developer dengan
            kreator berbakat. Kami menyediakan GFX, model 3D, map, UI, script, VFX, SFX, sistem,
            hingga kendaraan siap pakai untuk mempercepat proses development game Roblox Anda.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-14">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-surface p-6">
                <div className="h-11 w-11 rounded-xl bg-gradient-brand/15 flex items-center justify-center text-primary-2 mb-4">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-border bg-surface p-8 text-center">
            <h2 className="font-display font-bold text-xl">Misi Kami</h2>
            <p className="text-sm text-muted mt-3 max-w-xl mx-auto leading-relaxed">
              Mempercepat proses pengembangan game Roblox dengan menyediakan aset berkualitas
              tinggi yang mudah diakses, sekaligus memberikan wadah bagi kreator untuk
              memonetisasi karya mereka.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
