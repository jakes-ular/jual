import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";
import { Counter } from "@/components/ui/counter";

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="ambient-drift absolute -top-32 left-1/2 -translate-x-1/2 h-[32rem] w-[48rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-1.5 text-xs font-medium text-foreground/80 mb-6 animate-fade-in"
          style={{ animationDelay: "0ms" }}
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Dipercaya 5.000+ developer Roblox
        </div>

        <h1
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight max-w-4xl mx-auto animate-fade-in"
          style={{ animationDelay: "80ms" }}
        >
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

        <p
          className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto animate-fade-in"
          style={{ animationDelay: "160ms" }}
        >
          {subtitle}
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/catalog"
            className="prism-sweep inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-gradient-brand text-white font-semibold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Explore Assets <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-border hover:border-border-strong hover:bg-surface-2 font-semibold transition-all"
          >
            <LayoutGrid className="h-4 w-4" /> View Categories
          </Link>
        </div>

        <hr
          className="prism-rule w-16 mx-auto mt-16 rounded-full opacity-70 animate-fade-in"
          style={{ animationDelay: "320ms" }}
        />

        <dl
          className="mt-8 grid grid-cols-3 gap-6 max-w-lg mx-auto animate-fade-in"
          style={{ animationDelay: "380ms" }}
        >
          {[
            { value: 500, suffix: "+", label: "Aset Premium", decimals: 0 },
            { value: 5, suffix: "K+", label: "Developer", decimals: 0 },
            { value: 4.8, suffix: "★", label: "Rating Rata-rata", decimals: 1 },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display font-bold text-2xl sm:text-3xl">
                <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </dd>
              <dd className="text-xs text-muted mt-1">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
