"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/topup", label: "Topup Game", icon: Gamepad2 },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/appeals", label: "Appeals", icon: MessageSquareWarning },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
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
      <Link
        href="/"
        className="flex items-center gap-2.5 px-3.5 h-10 rounded-xl text-sm font-medium text-muted hover:text-foreground shrink-0 mt-2 lg:mt-4 border-t border-border lg:pt-4"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Situs
      </Link>
    </nav>
  );
}
