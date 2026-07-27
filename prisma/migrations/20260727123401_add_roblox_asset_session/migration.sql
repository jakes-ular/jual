-- CreateTable
CREATE TABLE "RobloxAssetSession" (
    "id" TEXT NOT NULL,
    "whitelistId" TEXT NOT NULL,
    "assetKey" TEXT NOT NULL DEFAULT 'marching',
    "placeId" TEXT NOT NULL,
    "placeName" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RobloxAssetSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RobloxAssetSession_lastSeenAt_idx" ON "RobloxAssetSession"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "RobloxAssetSession_whitelistId_assetKey_placeId_key" ON "RobloxAssetSession"("whitelistId", "assetKey", "placeId");

-- AddForeignKey
ALTER TABLE "RobloxAssetSession" ADD CONSTRAINT "RobloxAssetSession_whitelistId_fkey" FOREIGN KEY ("whitelistId") REFERENCES "RobloxWhitelist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
