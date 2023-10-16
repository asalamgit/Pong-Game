/*
  Warnings:

  - Made the column `muteFor` on table `ChannelUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChannelUser" ALTER COLUMN "muteFor" SET NOT NULL,
ALTER COLUMN "muteFor" SET DATA TYPE TIMESTAMP(0);
