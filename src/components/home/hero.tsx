import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-primary-2/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-foreground/80 mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Dipercaya 5.000+ developer Roblox
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight max-w-4xl mx-auto animate-fade-in">
          {title.split(" ").map((word, i, arr) =>
            i === arr.length - 2 || i === arr.length - 1 ? (
              <span key={i} className="text-gradient">
                {word}{" "}
              </span>
            ) : (
              <span key={i}>{word} </span>
            )
          )}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto animate-fade-in">
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-gradient-brand text-white font-semibold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Explore Assets <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-border hover:border-border-strong hover:bg-surface font-semibold transition-all"
          >
            <LayoutGrid className="h-4 w-4" /> View Categories
          </Link>
        </div>

        <dl className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            ["500+", "Aset Premium"],
            ["5K+", "Developer"],
            ["4.8★", "Rating Rata-rata"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-display font-extrabold text-2xl sm:text-3xl text-gradient">{value}</dd>
              <dd className="text-xs text-muted mt-1">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
