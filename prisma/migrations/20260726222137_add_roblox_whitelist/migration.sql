-- CreateTable
CREATE TABLE "RobloxWhitelist" (
    "id" TEXT NOT NULL,
    "robloxUsername" TEXT NOT NULL,
    "robloxUserId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RobloxWhitelist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RobloxWhitelist_robloxUserId_key" ON "RobloxWhitelist"("robloxUserId");

-- CreateIndex
CREATE INDEX "RobloxWhitelist_robloxUserId_idx" ON "RobloxWhitelist"("robloxUserId");
