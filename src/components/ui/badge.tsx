import { cn } from "@/lib/utils";

type BadgeVariant = "new" | "bestseller" | "featured" | "sale" | "draft" | "success" | "warning" | "danger" | "neutral";

const variants: Record<BadgeVariant, string> = {
  new: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  bestseller: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  featured: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  sale: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  draft: "bg-surface-2 text-muted border-border",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  neutral: "bg-surface-2 text-muted border-border",
};

const labels: Record<BadgeVariant, string> = {
  new: "New",
  bestseller: "Best Seller",
  featured: "Featured",
  sale: "Sale",
  draft: "Draft",
  success: "Success",
  warning: "Pending",
  danger: "Failed",
  neutral: "",
};

export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm",
        variants[variant],
        className
      )}
    >
      {children ?? labels[variant]}
    </span>
  );
}
