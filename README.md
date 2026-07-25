# ARK DIGITAL — Premium Roblox Assets Marketplace

Full-stack e-commerce marketplace for Roblox digital assets (GFX, 3D models, maps, UI kits,
scripts, vehicles, clothing, VFX, SFX, gameplay systems). Built with Next.js App Router,
TypeScript, Tailwind CSS, Prisma, and NextAuth.

## Stack & architecture decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | required |
| Styling | Tailwind CSS v4 | required, dark/neon theme in `src/app/globals.css` |
| Database | **SQLite** via Prisma (dev) | this sandbox has no Docker/Postgres available. Schema avoids Postgres-only features, so switching is a 2-line change — see below. |
| Auth | NextAuth v4, credentials provider, JWT sessions, RBAC (`USER`/`ADMIN`) | stable, well-documented, works cleanly with the App Router |
| File storage | Local filesystem (`src/lib/storage.ts`) behind a small interface | swappable for S3/Supabase Storage later without touching callers |
| Digital delivery | Short-lived signed JWT download tokens (`src/lib/download-token.ts`) verified against purchase ownership before streaming the file | prevents unauthenticated/unauthorized downloads |
| Payments | **Manual payment + Discord webhook notifications** (`src/lib/payment.ts`, `src/lib/discord.ts`) instead of a live gateway | per your instruction — buyer gets reference code + instructions (QRIS/e-wallet/bank transfer), a Discord embed notifies you of the new order, and you confirm payment by hand in `/admin/orders`. The `PaymentProvider` interface is ready to swap for Midtrans/Xendit/etc. later. |

### Switching SQLite → PostgreSQL later

1. `prisma/schema.prisma`: change `provider = "sqlite"` to `provider = "postgresql"`
2. `.env`: set `DATABASE_URL` to your Postgres connection string
3. `npx prisma migrate dev`

No model changes needed — the schema deliberately avoids SQLite/Postgres-incompatible features.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run db:seed          # 10 categories, 15 demo products, admin + demo user, site settings
npm run dev
```

Open http://localhost:3000.

**Admin login:** `admin@voxmarket.dev` / `Admin123!`
**Demo buyer login:** `demo@voxmarket.dev` / `Demo1234!`

### Environment variables (`.env`, see `.env.example`)

- `DATABASE_URL` — SQLite file path (or Postgres URL in production)
- `NEXTAUTH_SECRET`, `DOWNLOAD_TOKEN_SECRET` — auto-generated on first setup; rotate for production
- `DISCORD_WEBHOOK_URL` — optional. Without it, order/contact notifications silently no-op. Create one via Discord → Server Settings → Integrations → Webhooks, and orders/payment confirmations/contact messages will post there.
- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME` — used in SEO metadata, OG tags, sitemap

## What's implemented

- **Catalog**: search (name/description/category/tag), category filter, price range, sort (newest/bestselling/price/rating), pagination
- **Product detail**: gallery, pricing/discount, ratings, file info, features, reviews (only purchasers can review), related products, JSON-LD structured data
- **Cart**: zustand + localStorage persistence, quantity, duplicate-purchase prevention (checked against paid orders)
- **Checkout**: buyer info, payment method selection, order + payment record creation, Discord notification, reference code + instructions on the success page with status polling
- **Auth**: register/login (bcrypt + JWT), role-based middleware protecting `/dashboard` and `/admin`
- **User dashboard**: overview stats, profile edit, password change, purchases with signed downloads, download history, order history, wishlist
- **Admin panel**: product CRUD with image/digital-file upload, category CRUD, order management (manual status → PAID triggers salesCount increment + Discord confirmation), user management (role/status/delete), site settings (hero copy, contact info, bank/e-wallet details for manual payment instructions)
- **SEO**: per-page metadata, OG tags, `sitemap.ts`, `robots.ts`, product structured data, clean URLs (`/products/<slug>`)
- **UI**: dark theme with violet→cyan gradient accents, glassmorphism nav, skeleton loaders, empty/error states, toast notifications, responsive down to mobile with hamburger nav

## Known simplifications (given the "manual payment, no gateway" direction)

- No card data is ever collected or stored — by design, since payment confirmation is manual.
- The Discord webhook is a notification channel, not a payment webhook receiver; there's no automatic payment verification. If you later plug in Midtrans/Xendit, implement `PaymentProvider` in `src/lib/payment.ts` and add a webhook receiver route — everything else (order model, success page, admin confirmation UI) already supports that shape.
- SQLite has no native array/enum types, so those fields are plain strings (documented in `schema.prisma`); validated at the application layer via Zod.

## Scripts

```bash
npm run dev        # start dev server
npm run build       # production build
npm run db:migrate  # run Prisma migrations
npm run db:seed     # (re)seed demo data
npm run db:studio   # Prisma Studio GUI for the database
```
