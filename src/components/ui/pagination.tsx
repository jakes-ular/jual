"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  baseUrl,
  params,
}: {
  page: number;
  totalPages: number;
  baseUrl: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageList(page, totalPages);

  function buildHref(targetPage: number) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) sp.set(key, value);
    }
    sp.set("page", String(targetPage));
    return `${baseUrl}?${sp.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <PageLink
        href={buildHref(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-muted-2 text-sm">
            …
          </span>
        ) : (
          <PageLink key={p} href={buildHref(p)} active={p === page}>
            {p}
          </PageLink>
        )
      )}

      <PageLink
        href={buildHref(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...props
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="h-9 min-w-9 px-2 flex items-center justify-center rounded-lg text-muted-2 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "h-9 min-w-9 px-2 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors",
        active
          ? "bg-gradient-brand text-white border-transparent"
          : "border-border text-foreground/80 hover:border-border-strong hover:bg-surface"
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

function getPageList(current: number, total: number): (number | "...")[] {
  const delta = 1;
  const range: (number | "...")[] = [];
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  range.push(1);
  if (rangeStart > 2) range.push("...");
  for (let i = rangeStart; i <= rangeEnd; i++) range.push(i);
  if (rangeEnd < total - 1) range.push("...");
  if (total > 1) range.push(total);

  return range;
}
