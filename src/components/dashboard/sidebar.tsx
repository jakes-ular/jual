"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Package,
  Download,
  ClipboardList,
  Heart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/purchases", label: "My Purchases", icon: Package },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/orders", label: "Order History", icon: ClipboardList },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        const Icon = l.icon;
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
          </Link>
        );
      })}
    </nav>
  );
}
