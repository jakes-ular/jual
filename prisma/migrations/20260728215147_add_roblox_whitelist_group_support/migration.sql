-- DropIndex
DROP INDEX "RobloxWhitelist_robloxUserId_key";

-- AlterTable
ALTER TABLE "RobloxWhitelist" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "RobloxWhitelist_robloxUserId_type_key" ON "RobloxWhitelist"("robloxUserId", "type");
