import { LucideIcon, PackageSearch, AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-border bg-surface/50">
      <div className="h-14 w-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Gagal memuat data. Silakan coba lagi.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-danger/30 bg-danger/5">
      <div className="h-14 w-14 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-danger" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

export function NoResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={PackageSearch}
      title="Produk tidak ditemukan"
      description={
        query
          ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain atau ubah filter Anda.`
          : "Tidak ada produk yang cocok dengan filter Anda."
      }
    />
  );
}
