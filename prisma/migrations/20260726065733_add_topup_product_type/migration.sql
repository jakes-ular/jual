-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "topupServerId" TEXT,
ADD COLUMN     "topupTargetId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ASSET';
