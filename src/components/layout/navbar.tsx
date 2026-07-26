import { prisma } from "@/lib/prisma";
import { NavbarClient } from "@/components/layout/navbar-client";

export async function Navbar() {
  const categories = await prisma.category.findMany({
    where: { products: { some: { type: "ASSET", status: "PUBLISHED" } } },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return <NavbarClient categories={categories} />;
}
