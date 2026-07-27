"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  MessageSquareWarning,
  Settings,
  ArrowLeft,
  Gamepad2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/topup", label: "Topup Game", icon: Gamepad2, badgeKey: "topupOrderCount" as const },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, badgeKey: "orderCount" as const },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/appeals", label: "Appeals", icon: MessageSquareWarning },
  { href: "/admin/roblox-whitelist", label: "Roblox Whitelist", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// Polls a lightweight count endpoint so pending-order badges update while
// an admin sits on one page, not just on navigation -- matches the same
// "live" pattern used by the Roblox whitelist tracking table.
const POLL_INTERVAL_MS = 30_000;

export function AdminSidebar({
  initialOrderCount = 0,
  initialTopupOrderCount = 0,
}: {
  initialOrderCount?: number;
  initialTopupOrderCount?: number;
}) {
  const pathname = usePathname();
  const [counts, setCounts] = useState({
    orderCount: initialOrderCount,
    topupOrderCount: initialTopupOrderCount,
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) setCounts(await res.json());
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        const Icon = l.icon;
        const badgeCount = l.badgeKey ? counts[l.badgeKey] : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-2.5 px-3.5 h-10 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0",
              active
                ? "bg-gradient-brand text-white"
                : "text-foreground/75 hover:bg-surface hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" /> {l.label}
            {badgeCount > 0 && (
              <span className="ml-auto min-w-4.5 h-4.5 px-1 rounded-full bg-danger text-[10px] font-bold text-white flex items-center justify-center">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </Link>
        );
      })}
      <Link
        href="/"
        className="flex items-center gap-2.5 px-3.5 h-10 rounded-xl text-sm font-medium text-muted hover:text-foreground shrink-0 mt-2 lg:mt-4 border-t border-border lg:pt-4"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Situs
      </Link>
    </nav>
  );
}
