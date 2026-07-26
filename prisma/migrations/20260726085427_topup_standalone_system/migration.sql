-- Drop the Product-based topup fields (topup becomes a standalone subsystem)
ALTER TABLE "Product" DROP COLUMN "type";
ALTER TABLE "OrderItem" DROP COLUMN "topupTargetId";
ALTER TABLE "OrderItem" DROP COLUMN "topupServerId";

-- Make OrderItem.productId nullable so a Product can be deleted (e.g. a
-- DRAFT product with order history) without breaking past order records.
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- New standalone topup subsystem
CREATE TABLE "TopupGame" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopupGame_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TopupGame_slug_key" ON "TopupGame"("slug");
CREATE INDEX "TopupGame_status_idx" ON "TopupGame"("status");

CREATE TABLE "TopupItem" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopupItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TopupItem_gameId_idx" ON "TopupItem"("gameId");

ALTER TABLE "TopupItem" ADD CONSTRAINT "TopupItem_gameId_fkey"
  FOREIGN KEY ("gameId") REFERENCES "TopupGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TopupOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topupItemId" TEXT,
    "gameName" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "targetId" TEXT NOT NULL,
    "serverId" TEXT,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerContact" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofUrl" TEXT,
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "TopupOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TopupOrder_orderNumber_key" ON "TopupOrder"("orderNumber");
CREATE UNIQUE INDEX "TopupOrder_referenceCode_key" ON "TopupOrder"("referenceCode");
CREATE INDEX "TopupOrder_userId_idx" ON "TopupOrder"("userId");
CREATE INDEX "TopupOrder_status_idx" ON "TopupOrder"("status");
CREATE INDEX "TopupOrder_orderNumber_idx" ON "TopupOrder"("orderNumber");

ALTER TABLE "TopupOrder" ADD CONSTRAINT "TopupOrder_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TopupOrder" ADD CONSTRAINT "TopupOrder_topupItemId_fkey"
  FOREIGN KEY ("topupItemId") REFERENCES "TopupItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
