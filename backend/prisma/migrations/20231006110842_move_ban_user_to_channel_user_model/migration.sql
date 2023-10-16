/*
  Warnings:

  - You are about to drop the column `channelUsersBanId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ChannelRights` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChannelUsersBan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChannelRights" DROP CONSTRAINT "ChannelRights_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelRights" DROP CONSTRAINT "ChannelRights_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelUsersBan" DROP CONSTRAINT "ChannelUsersBan_channelId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_channelUsersBanId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "channelUsersBanId",
ADD COLUMN     "channelUserId" TEXT;

-- DropTable
DROP TABLE "ChannelRights";

-- DropTable
DROP TABLE "ChannelUsersBan";

-- CreateTable
CREATE TABLE "ChannelUser" (
    "id" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,
    "isOwner" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "ChannelUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_channelUserId_fkey" FOREIGN KEY ("channelUserId") REFERENCES "ChannelUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelUser" ADD CONSTRAINT "ChannelUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelUser" ADD CONSTRAINT "ChannelUser_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
