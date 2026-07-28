import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Gamepad2, Coins } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatRupiah } from "@/lib/utils";
import { buildTopupBackgroundStyle } from "@/lib/topup-theme";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getGame(slug: string) {
  return prisma.topupGame.findUnique({
    where: { slug },
    include: {
      items: { where: { status: "PUBLISHED" }, orderBy: { price: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) return { title: "Game tidak ditemukan" };
  return {
    title: `Topup ${game.name}`,
    description: game.description ?? `Topup diamond/UC ${game.name} — proses cepat dan aman.`,
  };
}

export default async function TopupGamePage({ params }: Props) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game || game.status !== "PUBLISHED") notFound();

  const pageBackground = buildTopupBackgroundStyle(game.bgColors, game.patternUrl, game.gradientDirection);

  return (
    <>
      <Navbar />
      <main className="flex-1" style={pageBackground}>
        {game.bannerUrl && (
          <div className="relative w-full h-40 sm:h-56 lg:h-72">
            <Image
              src={game.bannerUrl}
              alt={`Banner ${game.name}`}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </div>
        )}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-surface-2 mb-4">
              {game.icon ? (
                <Image src={game.icon} alt={game.name} fill sizes="96px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-2">
                  <Gamepad2 className="h-8 w-8" />
                </div>
              )}
            </div>
            <h1
              className="font-display font-bold text-3xl"
              style={game.textColor ? { color: game.textColor } : undefined}
            >
              Topup {game.name}
            </h1>
            {game.description && (
              <p
                className={game.textColor ? "text-sm mt-2 max-w-xl opacity-80" : "text-sm text-muted mt-2 max-w-xl"}
                style={game.textColor ? { color: game.textColor } : undefined}
              >
                {game.description}
              </p>
            )}
          </div>

          {game.items.length === 0 ? (
            <p className="text-center text-sm text-muted">Belum ada item topup untuk game ini.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {game.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/topup/${game.slug}/${item.id}`}
                  className="group rounded-2xl border border-border bg-surface p-5 hover-lift flex flex-col items-center text-center gap-2"
                >
                  <div className="relative h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-2 group-hover:bg-gradient-brand group-hover:text-white transition-colors overflow-hidden">
                    {item.icon ? (
                      <Image src={item.icon} alt={item.name} fill sizes="44px" className="object-cover" />
                    ) : (
                      <Coins className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold mt-1">{item.name}</h3>
                  <p className="font-display font-bold text-base">{formatRupiah(item.price)}</p>
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
