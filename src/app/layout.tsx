import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "ARK DIGITAL";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Premium Roblox Assets Marketplace`,
    template: `%s | ${siteName}`,
  },
  description:
    "Marketplace aset Roblox premium: GFX, pakaian/avatar, map, model 3D, UI, VFX, SFX, script, sistem, dan kendaraan berkualitas tinggi untuk developer Roblox.",
  keywords: [
    "roblox assets",
    "roblox gfx",
    "roblox scripts",
    "roblox 3d models",
    "roblox ui kit",
    "roblox marketplace",
  ],
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — Premium Roblox Assets Marketplace`,
    description:
      "Marketplace aset Roblox premium untuk developer: GFX, model 3D, map, UI, script, VFX, SFX, dan lainnya.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Premium Roblox Assets Marketplace`,
    description: "Marketplace aset Roblox premium untuk developer Roblox.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
