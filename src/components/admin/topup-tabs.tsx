"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TopupTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: "/admin/topup", label: "Game & Item" },
    { href: "/admin/topup/orders", label: "Order Topup" },
  ];

  return (
    <div className="flex gap-1 mb-6 border-b border-border">
      {tabs.map((t) => {
        const active = t.href === "/admin/topup" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-4 h-10 flex items-center text-sm font-medium border-b-2 -mb-px transition-colors",
              active ? "border-primary text-foreground" : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
