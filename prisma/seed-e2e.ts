import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const E2E_BUYER_EMAIL = "e2e-buyer@voxmarket.test";
export const E2E_BUYER_PASSWORD = "E2eBuyer123!";

async function main() {
  const passwordHash = await bcrypt.hash(E2E_BUYER_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: E2E_BUYER_EMAIL },
    update: { passwordHash, emailVerified: new Date(), status: "ACTIVE" },
    create: {
      name: "E2E Buyer",
      email: E2E_BUYER_EMAIL,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  console.log(`E2E buyer ready: ${E2E_BUYER_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
