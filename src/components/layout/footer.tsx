import Link from "next/link";
import { Send, Video, MessageCircle, Camera } from "lucide-react";
import { LogoMark } from "./logo-mark";

const shopLinks = [
  { href: "/catalog", label: "Semua Produk" },
  { href: "/catalog?category=roblox-gfx", label: "Roblox GFX" },
  { href: "/catalog?category=scripts", label: "Scripts" },
  { href: "/catalog?category=3d-models", label: "3D Models" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display font-bold text-lg">
                ARK <span className="text-gradient">DIGITAL</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              Marketplace aset Roblox premium untuk developer — GFX, model 3D, map, UI, script,
              VFX, SFX, dan lainnya.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {[Send, Video, MessageCircle, Camera].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-border-strong transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={shopLinks} />
          <FooterCol title="Company" links={companyLinks} />

          <div>
            <h4 className="font-display font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>support@arkdigital.com</li>
              <li>Discord: arkdigital.com/discord</li>
              <li>Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-2">
          <p>&copy; {new Date().getFullYear()} ARK DIGITAL. All rights reserved.</p>
          <p>Bukan produk resmi Roblox Corporation.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-sm mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted hover:text-foreground transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
