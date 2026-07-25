import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            <div className="stamp-badge inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase text-primary-2 mb-7 animate-fade-in">
              Verified Supplier &middot; Est. 2024
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight animate-fade-in">
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

            <p className="mt-6 text-base sm:text-lg text-muted max-w-xl leading-relaxed animate-fade-in">
              {subtitle}
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-in">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-md bg-gradient-brand text-white font-semibold shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                Explore Assets <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-md border border-border-strong hover:bg-surface font-semibold transition-all"
              >
                <LayoutGrid className="h-4 w-4" /> View Categories
              </Link>
            </div>

            <dl className="mt-12 flex items-stretch gap-6 sm:gap-10 border-t border-border pt-6 max-w-lg animate-fade-in">
              {[
                ["500+", "Aset Premium"],
                ["5,000+", "Developer"],
                ["4.8 / 5", "Rating"],
              ].map(([value, label], i) => (
                <div key={label} className={i > 0 ? "pl-6 sm:pl-10 border-l border-border" : ""}>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-2">{label}</dt>
                  <dd className="font-display font-semibold text-xl text-foreground mt-1">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <BlueprintGem />
        </div>
      </div>
    </section>
  );
}

function BlueprintGem() {
  return (
    <div className="relative mx-auto w-full max-w-md aspect-square animate-fade-in">
      <div className="crop-marks absolute inset-4 border border-dashed border-border-strong/70 rounded-sm">
        <span />
      </div>
      <svg viewBox="0 0 320 320" className="relative h-full w-full" aria-hidden="true">
        <g fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinejoin="round">
          <path
            className="draw-in"
            d="M160,60 L235,140 L160,280 L85,140 Z
               M85,140 L235,140
               M160,60 L128,140 M160,60 L192,140
               M160,280 L128,140 M160,280 L192,140"
          />
        </g>

        {/* callout: top */}
        <circle cx="160" cy="60" r="3" fill="var(--primary)" />
        <line x1="160" y1="60" x2="160" y2="24" stroke="var(--muted-2)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="160" y="16" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--muted)" letterSpacing="0.05em">
          GAME-READY
        </text>

        {/* callout: left */}
        <circle cx="85" cy="140" r="3" fill="var(--primary)" />
        <line x1="85" y1="140" x2="28" y2="140" stroke="var(--muted-2)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="24" y="137" textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--muted)" letterSpacing="0.05em">
          LOW-POLY
        </text>

        {/* callout: right */}
        <circle cx="235" cy="140" r="3" fill="var(--primary)" />
        <line x1="235" y1="140" x2="292" y2="140" stroke="var(--muted-2)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="296" y="137" textAnchor="start" fontFamily="var(--font-mono)" fontSize="10" fill="var(--muted)" letterSpacing="0.05em">
          PBR
        </text>

        {/* callout: bottom */}
        <circle cx="160" cy="280" r="3" fill="var(--primary)" />
        <line x1="160" y1="280" x2="160" y2="304" stroke="var(--muted-2)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="160" y="316" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--muted)" letterSpacing="0.05em">
          SKU-0001
        </text>
      </svg>
    </div>
  );
}
