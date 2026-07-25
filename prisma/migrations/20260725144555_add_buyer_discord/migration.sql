/*
  Warnings:

  - Added the required column `buyerDiscord` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "buyerDiscord" TEXT NOT NULL DEFAULT '-';
ALTER TABLE "Order" ALTER COLUMN "buyerDiscord" DROP DEFAULT;
