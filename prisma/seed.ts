import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";
import { generatePlaceholder } from "./placeholder";
import { slugify } from "../src/lib/utils";
import { saveFileBuffer } from "../src/lib/storage";

const prisma = new PrismaClient();

async function makePlaceholderFile(productSlug: string, fileName: string, kb = 512) {
  const storageName = `seed-${productSlug}-${Date.now()}${path.extname(fileName)}`;
  const content = `ARK DIGITAL demo asset file for "${productSlug}"\nThis is placeholder content standing in for the real digital asset.\n`.repeat(
    Math.max(1, Math.floor((kb * 1024) / 90))
  );
  const stored = await saveFileBuffer(Buffer.from(content), storageName);
  return { storagePath: stored.storagePath, sizeBytes: stored.sizeBytes };
}

interface SeedProduct {
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  shortDescription: string;
  description: string;
  features: string[];
  fileFormat: string;
  fileSize: string;
  compatibility: string;
  version: string;
  changelog: string;
  tags: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  salesCount: number;
  ratingAvg: number;
  ratingCount: number;
  gradient: [string, string];
  createdDaysAgo: number;
}

const categories = [
  { name: "Roblox GFX", slug: "roblox-gfx", icon: "Palette", description: "Thumbnail, poster, dan promotional art bergaya Roblox." },
  { name: "3D Models", slug: "3d-models", icon: "Box", description: "Model 3D siap pakai untuk build dan aset dalam game." },
  { name: "Maps", slug: "maps", icon: "Map", description: "Map dan environment siap import untuk berbagai genre game." },
  { name: "UI", slug: "ui", icon: "LayoutTemplate", description: "UI kit, HUD, dan komponen interface Roblox." },
  { name: "Scripts", slug: "scripts", icon: "Code2", description: "Script Luau siap pakai untuk gameplay dan sistem." },
  { name: "Vehicles", slug: "vehicles", icon: "Car", description: "Kendaraan drivable lengkap dengan script." },
  { name: "Clothing", slug: "clothing", icon: "Shirt", description: "Pakaian dan aset avatar Roblox." },
  { name: "VFX", slug: "vfx", icon: "Sparkles", description: "Visual effects dan particle pack." },
  { name: "SFX", slug: "sfx", icon: "Music", description: "Sound effect pack untuk game Roblox." },
  { name: "Systems", slug: "systems", icon: "Cpu", description: "Sistem gameplay lengkap siap integrasi." },
];

const products: SeedProduct[] = [
  {
    name: "Roblox Military Vehicle Pack",
    category: "Vehicles",
    price: 75000,
    shortDescription: "6 kendaraan militer drivable lengkap dengan script kontrol.",
    description:
      "Kumpulan 6 kendaraan militer (jeep, APC, truk suplai, tank ringan, motor scout, dan artileri mobile) yang sudah di-rig dan siap drive. Termasuk script drive seat, suara mesin, dan efek asap knalpot.",
    features: [
      "6 model kendaraan unik dengan LOD optimization",
      "Script drive seat plug-and-play",
      "Custom sound engine per kendaraan",
      "Material PBR-ready",
      "Dokumentasi setup lengkap",
    ],
    fileFormat: ".rbxm / .rbxmx",
    fileSize: "48 MB",
    compatibility: "Roblox Studio 2023+",
    version: "2.1.0",
    changelog: "v2.1.0: perbaikan collision pada APC, tambah motor scout baru.",
    tags: ["vehicle", "military", "drivable", "war game"],
    isBestSeller: true,
    salesCount: 482,
    ratingAvg: 4.8,
    ratingCount: 96,
    gradient: ["#0f172a", "#334155"],
    createdDaysAgo: 120,
  },
  {
    name: "Cinematic Roblox GFX Thumbnail Bundle",
    category: "Roblox GFX",
    price: 45000,
    discountPrice: 32000,
    shortDescription: "10 template thumbnail sinematik siap edit di Blender & Photoshop.",
    description:
      "Bundle 10 template GFX bergaya cinematic untuk thumbnail game Roblox Anda. Sudah termasuk file .blend dengan lighting HDRI dan file .psd untuk compositing akhir.",
    features: [
      "10 template resolusi 1920x1080 & 1280x720",
      "File Blender dengan lighting siap pakai",
      "Layer .PSD terorganisir",
      "Font & brush pack tambahan",
    ],
    fileFormat: ".blend / .psd",
    fileSize: "1.2 GB",
    compatibility: "Blender 3.6+, Photoshop 2022+",
    version: "1.4.0",
    changelog: "v1.4.0: tambah 3 template baru tema horror.",
    tags: ["gfx", "thumbnail", "cinematic", "blender"],
    isFeatured: true,
    salesCount: 731,
    ratingAvg: 4.9,
    ratingCount: 154,
    gradient: ["#7c3aed", "#db2777"],
    createdDaysAgo: 8,
  },
  {
    name: "Modern City Map — Downtown District",
    category: "Maps",
    price: 120000,
    shortDescription: "Map kota modern seluas 4x4 stud besar dengan 40+ bangunan detail.",
    description:
      "Map downtown kota modern lengkap dengan jalan, trotoar, sistem lampu lalu lintas, dan lebih dari 40 bangunan yang bisa dimasuki. Cocok untuk game roleplay, racing, atau open-world.",
    features: [
      "40+ bangunan interior/exterior detail",
      "Sistem jalan & traffic light siap pakai",
      "Optimized streaming untuk performa tinggi",
      "Free-mod terrain tambahan",
    ],
    fileFormat: ".rbxl",
    fileSize: "210 MB",
    compatibility: "Roblox Studio 2023+",
    version: "3.0.2",
    changelog: "v3.0.2: optimasi part count, perbaikan collision trotoar.",
    tags: ["map", "city", "roleplay", "open world"],
    isBestSeller: true,
    salesCount: 356,
    ratingAvg: 4.7,
    ratingCount: 88,
    gradient: ["#0891b2", "#0f172a"],
    createdDaysAgo: 60,
  },
  {
    name: "Sci-Fi HUD & Menu UI Kit",
    category: "UI",
    price: 55000,
    shortDescription: "UI kit futuristik lengkap: HUD, inventory, menu utama, dan settings.",
    description:
      "UI kit bertema sci-fi dengan lebih dari 30 komponen: health bar, minimap frame, inventory grid, main menu, dan settings panel. Semua elemen vector-based dan mudah dikustomisasi warnanya.",
    features: [
      "30+ komponen UI siap pakai",
      "Struktur GuiObject terorganisir",
      "Animasi transisi built-in",
      "Palet warna mudah diubah",
    ],
    fileFormat: ".rbxmx",
    fileSize: "18 MB",
    compatibility: "Roblox Studio (semua versi)",
    version: "1.2.0",
    changelog: "v1.2.0: tambah komponen leaderboard & shop UI.",
    tags: ["ui", "hud", "scifi", "inventory"],
    isFeatured: true,
    salesCount: 512,
    ratingAvg: 4.6,
    ratingCount: 120,
    gradient: ["#06b6d4", "#1e293b"],
    createdDaysAgo: 25,
  },
  {
    name: "Advanced Inventory System (Luau)",
    category: "Systems",
    price: 150000,
    shortDescription: "Sistem inventory drag-and-drop lengkap dengan stacking & save data.",
    description:
      "Sistem inventory production-ready dengan drag-and-drop, item stacking, tooltip, dan integrasi DataStore untuk penyimpanan otomatis. Dokumentasi API lengkap untuk menambahkan item custom.",
    features: [
      "Drag-and-drop antar slot",
      "Item stacking otomatis",
      "Integrasi DataStore2",
      "Event API untuk custom item",
      "Anti-dupe protection",
    ],
    fileFormat: ".rbxm + dokumentasi PDF",
    fileSize: "6 MB",
    compatibility: "Roblox Studio 2023+, Luau",
    version: "4.2.1",
    changelog: "v4.2.1: perbaikan bug duplikasi saat server lag.",
    tags: ["script", "inventory", "system", "datastore"],
    isBestSeller: true,
    isFeatured: true,
    salesCount: 640,
    ratingAvg: 4.9,
    ratingCount: 201,
    gradient: ["#4338ca", "#0f172a"],
    createdDaysAgo: 200,
  },
  {
    name: "Anime Streetwear Avatar Bundle",
    category: "Clothing",
    price: 35000,
    shortDescription: "Set pakaian streetwear bergaya anime untuk avatar Roblox.",
    description:
      "Bundle pakaian avatar bertema anime streetwear: jaket oversized, celana cargo, sepatu, dan aksesoris topi. Template layered clothing dengan UV map rapi untuk kustomisasi lanjutan.",
    features: [
      "5 item pakaian layered",
      "Template PSD UV map",
      "Kompatibel R15 & R6",
      "Warna alternatif termasuk",
    ],
    fileFormat: ".png template + .psd",
    fileSize: "85 MB",
    compatibility: "Roblox R15 / R6",
    version: "1.0.3",
    changelog: "v1.0.3: perbaikan UV pada bagian lengan jaket.",
    tags: ["clothing", "avatar", "anime", "streetwear"],
    salesCount: 289,
    ratingAvg: 4.5,
    ratingCount: 63,
    gradient: ["#db2777", "#7c3aed"],
    createdDaysAgo: 5,
  },
  {
    name: "Magic Particle VFX Pack Vol. 1",
    category: "VFX",
    price: 60000,
    shortDescription: "40+ efek partikel sihir: fireball, heal aura, lightning, dan lainnya.",
    description:
      "Kumpulan 40+ visual effect bertema magic siap pakai, termasuk fireball, ice shard, heal aura, lightning strike, dan teleport effect. Semua dibuat dengan ParticleEmitter native Roblox.",
    features: [
      "40+ efek partikel siap pakai",
      "Preview video untuk tiap efek",
      "Ringan untuk performa game",
      "Mudah dikombinasikan dengan script sendiri",
    ],
    fileFormat: ".rbxm",
    fileSize: "22 MB",
    compatibility: "Roblox Studio (semua versi)",
    version: "1.1.0",
    changelog: "v1.1.0: tambah 10 efek elemental baru.",
    tags: ["vfx", "particle", "magic", "effects"],
    isFeatured: true,
    salesCount: 398,
    ratingAvg: 4.7,
    ratingCount: 77,
    gradient: ["#8b5cf6", "#0891b2"],
    createdDaysAgo: 45,
  },
  {
    name: "Combat SFX Bundle — Impact & Weapons",
    category: "SFX",
    price: 40000,
    shortDescription: "60+ sound effect pertarungan: pukulan, tembakan, dan ledakan.",
    description:
      "Paket 60+ sound effect combat berkualitas tinggi: hit impact, gunfire, explosion, sword clash, dan footstep. Format .ogg teroptimasi untuk Roblox dengan volume ternormalisasi.",
    features: [
      "60+ file SFX format .ogg",
      "Volume ternormalisasi",
      "Kategori terorganisir (melee, ranged, explosion)",
      "Lisensi royalty-free",
    ],
    fileFormat: ".ogg",
    fileSize: "34 MB",
    compatibility: "Roblox Studio (semua versi)",
    version: "1.0.0",
    changelog: "Rilis awal.",
    tags: ["sfx", "combat", "sound", "weapons"],
    salesCount: 210,
    ratingAvg: 4.4,
    ratingCount: 41,
    gradient: ["#f59e0b", "#0f172a"],
    createdDaysAgo: 3,
  },
  {
    name: "Low-Poly Fantasy Village Model Set",
    category: "3D Models",
    price: 68000,
    discountPrice: 49000,
    shortDescription: "25+ model bangunan & prop desa fantasi bergaya low-poly.",
    description:
      "Set 25+ model low-poly untuk membangun desa fantasi: rumah kayu, kincir angin, pasar, pagar, dan prop dekorasi. Cocok untuk RPG, survival, atau game roleplay medieval.",
    features: [
      "25+ model bangunan & prop",
      "Style low-poly konsisten",
      "Part count optimal untuk performa",
      "Mudah disusun ulang jadi layout baru",
    ],
    fileFormat: ".rbxm",
    fileSize: "40 MB",
    compatibility: "Roblox Studio (semua versi)",
    version: "2.0.0",
    changelog: "v2.0.0: restyle seluruh model ke low-poly, tambah pasar.",
    tags: ["3d model", "fantasy", "village", "low poly"],
    isBestSeller: true,
    salesCount: 445,
    ratingAvg: 4.8,
    ratingCount: 102,
    gradient: ["#16a34a", "#0f172a"],
    createdDaysAgo: 90,
  },
  {
    name: "Sports Car Racing Pack",
    category: "Vehicles",
    price: 95000,
    shortDescription: "4 mobil sport drivable dengan sistem drift & nitro.",
    description:
      "Empat mobil sport premium dengan sistem drive realistis, drift mechanic, dan nitro boost. Termasuk script tuning stat (top speed, handling, acceleration) yang mudah disesuaikan.",
    features: [
      "4 model mobil sport detail tinggi",
      "Sistem drift & nitro boost",
      "Script tuning stat mudah",
      "Efek asap ban & lampu dinamis",
    ],
    fileFormat: ".rbxm",
    fileSize: "62 MB",
    compatibility: "Roblox Studio 2023+",
    version: "1.3.0",
    changelog: "v1.3.0: perbaikan physics drift di tikungan tajam.",
    tags: ["vehicle", "racing", "car", "drift"],
    salesCount: 267,
    ratingAvg: 4.6,
    ratingCount: 58,
    gradient: ["#dc2626", "#0f172a"],
    createdDaysAgo: 14,
  },
  {
    name: "Horror Forest Map with Dynamic Fog",
    category: "Maps",
    price: 85000,
    shortDescription: "Map hutan horor dengan sistem fog dinamis & lighting atmosferik.",
    description:
      "Map hutan gelap bertema horor lengkap dengan sistem fog dinamis, lighting atmosferik, dan pohon-pohon detail. Cocok untuk game horror, survival, atau escape room.",
    features: [
      "Sistem fog dinamis berbasis waktu",
      "200+ pohon & vegetasi detail",
      "Lighting atmosferik siap pakai",
      "Sound ambience terintegrasi",
    ],
    fileFormat: ".rbxl",
    fileSize: "175 MB",
    compatibility: "Roblox Studio 2023+",
    version: "1.1.2",
    changelog: "v1.1.2: perbaikan performa fog di server dengan banyak pemain.",
    tags: ["map", "horror", "forest", "fog"],
    salesCount: 198,
    ratingAvg: 4.5,
    ratingCount: 47,
    gradient: ["#166534", "#020617"],
    createdDaysAgo: 33,
  },
  {
    name: "Minimalist Shop & Currency UI Kit",
    category: "UI",
    price: 42000,
    shortDescription: "UI kit toko in-game minimalis dengan sistem mata uang ganda.",
    description:
      "UI kit shop minimalis dengan dukungan dua mata uang (soft & hard currency), kategori item, dan animasi purchase yang halus. Cocok untuk simulator maupun tycoon game.",
    features: [
      "Sistem dual currency siap pakai",
      "Filter kategori item",
      "Animasi purchase halus",
      "Struktur mudah diintegrasikan dengan DataStore",
    ],
    fileFormat: ".rbxmx",
    fileSize: "12 MB",
    compatibility: "Roblox Studio (semua versi)",
    version: "1.0.1",
    changelog: "v1.0.1: perbaikan minor pada alignment mobile.",
    tags: ["ui", "shop", "currency", "simulator"],
    salesCount: 176,
    ratingAvg: 4.3,
    ratingCount: 39,
    gradient: ["#0ea5e9", "#1e293b"],
    createdDaysAgo: 55,
  },
  {
    name: "Ninja Warrior Avatar Set",
    category: "Clothing",
    price: 30000,
    shortDescription: "Set kostum ninja lengkap dengan aksesoris senjata dekoratif.",
    description:
      "Kostum ninja lengkap dengan jubah, ikat kepala, dan aksesoris senjata dekoratif (non-fungsional, murni kosmetik). Tersedia dalam 4 varian warna klan.",
    features: [
      "4 varian warna klan",
      "Aksesoris senjata dekoratif",
      "Kompatibel R15 & R6",
      "Template layered untuk kustomisasi",
    ],
    fileFormat: ".png template + .psd",
    fileSize: "70 MB",
    compatibility: "Roblox R15 / R6",
    version: "1.0.0",
    changelog: "Rilis awal.",
    tags: ["clothing", "avatar", "ninja", "warrior"],
    salesCount: 134,
    ratingAvg: 4.2,
    ratingCount: 28,
    gradient: ["#1e1b4b", "#7c3aed"],
    createdDaysAgo: 2,
  },
  {
    name: "Anti-Cheat & Exploit Protection System",
    category: "Systems",
    price: 180000,
    shortDescription: "Sistem proteksi server-side melawan exploit umum & speed hack.",
    description:
      "Sistem anti-cheat server-side yang mendeteksi exploit umum seperti speed hack, teleport hack, dan infinite jump. Termasuk sistem logging pelanggaran dan auto-kick yang bisa dikonfigurasi.",
    features: [
      "Deteksi speed hack & teleport hack",
      "Auto-kick & logging pelanggaran",
      "Konfigurasi threshold mudah",
      "Update rutin mengikuti exploit terbaru",
    ],
    fileFormat: ".rbxm + dokumentasi PDF",
    fileSize: "4 MB",
    compatibility: "Roblox Studio 2023+, Luau",
    version: "5.0.0",
    changelog: "v5.0.0: deteksi baru untuk exploit hitbox extender.",
    tags: ["script", "anticheat", "security", "system"],
    isFeatured: true,
    isBestSeller: true,
    salesCount: 523,
    ratingAvg: 4.9,
    ratingCount: 187,
    gradient: ["#0f172a", "#dc2626"],
    createdDaysAgo: 150,
  },
  {
    name: "Epic Boss Battle VFX Pack",
    category: "VFX",
    price: 70000,
    shortDescription: "Efek visual boss battle: shockwave, summon, dan ultimate attack.",
    description:
      "Paket efek visual skala besar untuk boss battle: shockwave ground slam, summon portal, charge-up aura, dan ultimate attack beam. Dirancang untuk pertarungan skala epik.",
    features: [
      "15+ efek skala besar",
      "Cocok untuk boss fight & ultimate ability",
      "Preview video tersedia",
      "Ringan meski efek berskala besar",
    ],
    fileFormat: ".rbxm",
    fileSize: "30 MB",
    compatibility: "Roblox Studio (semua versi)",
    version: "1.0.2",
    changelog: "v1.0.2: optimasi shockwave effect.",
    tags: ["vfx", "boss", "battle", "ultimate"],
    salesCount: 156,
    ratingAvg: 4.6,
    ratingCount: 34,
    gradient: ["#7c2d12", "#0f172a"],
    createdDaysAgo: 20,
  },
];

async function main() {
  console.log("Seeding database...");

  // ---- Admin user ----
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@voxmarket.dev").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "ARK DIGITAL Admin",
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  // ---- Demo customer ----
  const demoHash = await bcrypt.hash("Demo1234!", 12);
  await prisma.user.upsert({
    where: { email: "demo@voxmarket.dev" },
    update: {},
    create: {
      name: "Demo Buyer",
      email: "demo@voxmarket.dev",
      passwordHash: demoHash,
      role: "USER",
    },
  });
  console.log("Demo customer ready: demo@voxmarket.dev / Demo1234!");

  // ---- Categories ----
  const categoryRecords: Record<string, { id: string }> = {};
  for (const c of categories) {
    const rec = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon },
      create: c,
    });
    categoryRecords[c.name] = rec;
  }
  console.log(`${categories.length} categories ready`);

  // ---- Products ----
  for (const p of products) {
    const slug = slugify(p.name);
    const category = categoryRecords[p.category];
    if (!category) throw new Error(`Unknown category: ${p.category}`);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      console.log(`Skipping existing product: ${p.name}`);
      continue;
    }

    const createdAt = new Date(Date.now() - p.createdDaysAgo * 24 * 60 * 60 * 1000);

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        categoryId: category.id,
        tags: p.tags.join(","),
        features: p.features.join("\n"),
        fileFormat: p.fileFormat,
        fileSize: p.fileSize,
        compatibility: p.compatibility,
        version: p.version,
        changelog: p.changelog,
        status: "PUBLISHED",
        isFeatured: !!p.isFeatured,
        isBestSeller: !!p.isBestSeller,
        salesCount: p.salesCount,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // gallery images (3 variants of the placeholder)
    const [from, to] = p.gradient;
    for (let i = 0; i < 3; i++) {
      const url = await generatePlaceholder({
        label: i === 0 ? p.name : `${p.name} — preview ${i + 1}`,
        tag: p.category,
        from: i % 2 === 0 ? from : to,
        to: i % 2 === 0 ? to : from,
      });
      await prisma.productImage.create({
        data: { productId: product.id, url, alt: p.name, position: i },
      });
    }

    // digital deliverable file
    const file = await makePlaceholderFile(slug, `${slug}${p.fileFormat.split(" ")[0].split("/")[0]}`);
    await prisma.productFile.create({
      data: {
        productId: product.id,
        fileName: `${slug}${path.extname(p.fileFormat.split(" ")[0]) || ".zip"}`,
        storagePath: file.storagePath,
        sizeBytes: file.sizeBytes,
      },
    });

    console.log(`Created product: ${p.name}`);
  }

  // ---- Site settings ----
  const settings: Record<string, string> = {
    storeName: "ARK DIGITAL",
    storeTagline: "Premium Roblox Assets for Your Next Project",
    heroTitle: "Premium Roblox Assets for Your Next Project",
    heroSubtitle:
      "Temukan ribuan aset Roblox berkualitas tinggi — GFX, model 3D, map, UI, script, VFX, SFX, dan sistem siap pakai untuk mempercepat development game Anda.",
    logoUrl: "",
    bannerUrl: "",
    contactEmail: "support@arkdigital.com",
    contactDiscord: "arkdigital.com/discord",
    socialTwitter: "https://twitter.com/arkdigital",
    socialYoutube: "https://youtube.com/@arkdigital",
    socialInstagram: "https://instagram.com/arkdigital",
    footerText: "Marketplace aset Roblox premium untuk developer.",
    bankName: "Bank Central Asia (BCA)",
    bankAccountNumber: "1234567890",
    bankAccountName: "PT ARK Digital Kreasi",
    ewalletNumber: "0812-3456-7890",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log("Site settings ready");

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
