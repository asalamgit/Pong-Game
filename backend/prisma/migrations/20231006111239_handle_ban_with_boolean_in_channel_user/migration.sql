/*
  Warnings:

  - Added the required column `isBan` to the `ChannelUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChannelUser" DROP CONSTRAINT "ChannelUser_userId_fkey";

-- AlterTable
ALTER TABLE "ChannelUser" ADD COLUMN     "isBan" BOOLEAN NOT NULL;
