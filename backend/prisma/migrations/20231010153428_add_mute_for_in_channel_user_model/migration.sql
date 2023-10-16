/*
  Warnings:

  - Added the required column `muteFor` to the `ChannelUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChannelUser" ADD COLUMN     "muteFor" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFaSecret" TEXT;
