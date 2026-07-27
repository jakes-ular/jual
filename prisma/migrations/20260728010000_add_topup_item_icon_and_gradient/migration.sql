-- AlterTable
ALTER TABLE "TopupItem" ADD COLUMN "icon" TEXT;

-- AlterTable
ALTER TABLE "TopupGame" ADD COLUMN "bgColors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "TopupGame" ADD COLUMN "patternUrl" TEXT;

-- Migrate existing single bgColor into the new bgColors array before dropping it
UPDATE "TopupGame" SET "bgColors" = ARRAY["bgColor"] WHERE "bgColor" IS NOT NULL AND "bgColor" <> '';

ALTER TABLE "TopupGame" DROP COLUMN "bgColor";
