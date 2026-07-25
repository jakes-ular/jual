"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  name: string;
  slug: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "bestselling", label: "Terlaris" },
  { value: "price-asc", label: "Harga Terendah" },
  { value: "price-desc", label: "Harga Tertinggi" },
  { value: "rating", label: "Rating Tertinggi" },
];

export function CatalogFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q });
  }

  function handlePriceApply() {
    pushParams({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  }

  function clearAll() {
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  }

  const hasActiveFilters = !!(activeCategory || minPrice || maxPrice || searchParams.get("q"));

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama produk, deskripsi, kategori, atau tag..."
            className="pl-9 h-11"
          />
        </form>

        <Select
          value={activeSort}
          onChange={(e) => pushParams({ sort: e.target.value })}
          className="h-11 sm:w-56"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Button
          type="button"
          variant="outline"
          className="sm:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className={cn("mt-4 flex flex-col sm:flex-row sm:items-center gap-4", !mobileOpen && "hidden sm:flex")}>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!activeCategory} onClick={() => pushParams({ category: null })}>
            Semua Kategori
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.slug}
              active={activeCategory === c.slug}
              onClick={() => pushParams({ category: c.slug })}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <Input
            type="number"
            min={0}
            placeholder="Harga min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-32 h-9"
          />
          <span className="text-muted-2 text-sm">—</span>
          <Input
            type="number"
            min={0}
            placeholder="Harga max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-32 h-9"
          />
          <Button size="sm" variant="secondary" onClick={handlePriceApply}>
            Terapkan
          </Button>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearAll} className="text-muted">
              <X className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 h-8 rounded-full text-xs font-medium border transition-colors",
        active
          ? "bg-gradient-brand text-white border-transparent"
          : "border-border text-foreground/75 hover:border-border-strong hover:bg-surface"
      )}
    >
      {children}
    </button>
  );
}
