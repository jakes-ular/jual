import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Topup Game",
  description: "Topup diamond, UC, dan mata uang game favorit Anda — proses cepat dan aman.",
};

export default async function TopupPage() {
  const games = await prisma.topupGame.findMany({
    where: { status: "PUBLISHED", items: { some: { status: "PUBLISHED" } } },
    select: { id: true, name: true, slug: true, icon: true, description: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl">Topup Game</h1>
            <p className="text-sm text-muted mt-2">
              Pilih game favorit Anda untuk melihat pilihan diamond/UC yang tersedia.
            </p>
          </div>

          {games.length === 0 ? (
            <EmptyState icon={Gamepad2} title="Belum ada game tersedia" description="Cek lagi nanti." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {games.map((g) => (
                <Link
                  key={g.id}
                  href={`/topup/${g.slug}`}
                  className="group rounded-2xl border border-border bg-surface overflow-hidden hover-lift flex flex-col"
                >
                  <div className="relative aspect-square w-full bg-surface-2">
                    {g.icon ? (
                      <Image
                        src={g.icon}
                        alt={g.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-2">
                        <Gamepad2 className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold">{g.name}</h3>
                    {g.description && (
                      <p className="text-xs text-muted mt-1 line-clamp-2">{g.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
