/*
  Warnings:

  - Added the required column `channel` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "channel" TEXT NOT NULL,
ADD COLUMN     "formatted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalMessage" TEXT,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "oldPrice" DROP NOT NULL,
ALTER COLUMN "newPrice" DROP NOT NULL,
ALTER COLUMN "link" DROP NOT NULL;
