"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

interface Category {
  name: string;
  slug: string;
}

export function NavbarClient({ categories }: { categories: Category[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");

  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  useEffect(() => setMounted(true), []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMobileOpen(false);
    router.push(query.trim() ? `/catalog?q=${encodeURIComponent(query.trim())}` : "/catalog");
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Catalog" },
    { href: "/topup", label: "Topup Game" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 glass" style={{ viewTransitionName: "site-header" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <LogoMark className="h-12 w-12 sm:h-14 sm:w-14" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="nav-underline px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="nav-underline px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors inline-flex items-center gap-1">
                Categories <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full pt-2 w-56 popover-in">
                  <div className="rounded-xl glass p-2 grid gap-0.5 glow-ring">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/catalog?category=${c.slug}`}
                        className="px-3 py-2 text-sm rounded-lg hover:bg-surface-2 text-foreground/85"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari aset Roblox..."
              className="w-full h-10 rounded-full bg-surface border border-border pl-9 pr-4 text-sm placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
            />
          </form>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Link
              href="/cart"
              className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-surface-2 transition-colors"
              aria-label="Keranjang"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 rounded-full bg-gradient-brand text-[10px] font-bold text-white flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {mounted && status === "authenticated" ? (
              <div
                className="relative"
                onMouseEnter={() => setUserOpen(true)}
                onMouseLeave={() => setUserOpen(false)}
              >
                <button className="h-10 w-10 rounded-full bg-surface-2 border border-border flex items-center justify-center hover:border-border-strong">
                  <UserIcon className="h-4.5 w-4.5" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full pt-2 w-52 popover-in">
                    <div className="rounded-xl glass p-2 glow-ring">
                      <div className="px-3 py-2 text-xs text-muted truncate border-b border-border mb-1">
                        {session.user?.email}
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-2"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      {session.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-2"
                        >
                          <ShieldCheck className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-surface-2 text-danger"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 h-10 flex items-center rounded-xl text-sm font-medium border border-border hover:border-border-strong transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 h-10 flex items-center rounded-xl text-sm font-medium bg-gradient-brand text-white hover:brightness-110 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-surface-2"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height] duration-300 border-t border-border",
          mobileOpen ? "max-h-[32rem]" : "max-h-0 border-t-0"
        )}
      >
        <div className="px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari aset Roblox..."
              className="w-full h-10 rounded-full bg-surface border border-border pl-9 pr-4 text-sm placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </form>
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-surface-2"
              >
                {l.label}
              </Link>
            ))}
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-2 uppercase tracking-wide mt-2">
              Categories
            </div>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/catalog?category=${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 text-sm rounded-lg hover:bg-surface-2 text-foreground/85"
              >
                {c.name}
              </Link>
            ))}
          </div>
          {!(mounted && status === "authenticated") && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 h-10 flex items-center justify-center rounded-xl text-sm font-medium border border-border"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 h-10 flex items-center justify-center rounded-xl text-sm font-medium bg-gradient-brand text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
