import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 sm:p-14 text-center">
          <div className="ambient-drift absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-[36rem] bg-gradient-brand opacity-20 blur-3xl -z-0" />
          <div className="relative z-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand mb-5">
              <Store className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl max-w-xl mx-auto">
              Siap mempercepat development game Roblox Anda?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted max-w-xl mx-auto">
              Jelajahi ratusan aset premium siap pakai, atau mulai jual karya Anda sendiri ke
              komunitas developer Roblox terbesar.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="prism-sweep inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-brand text-white font-semibold hover:brightness-110 transition-all"
              >
                Jelajahi Katalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl border border-border hover:border-border-strong font-semibold transition-all"
              >
                Jadi Creator/Seller
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
