/*
  Warnings:

  - Added the required column `isOwner` to the `ChannelRights` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChannelRights" DROP CONSTRAINT "ChannelRights_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelRights" DROP CONSTRAINT "ChannelRights_userId_fkey";

-- AlterTable
ALTER TABLE "ChannelRights" ADD COLUMN     "isOwner" BOOLEAN NOT NULL;

-- AddForeignKey
ALTER TABLE "ChannelRights" ADD CONSTRAINT "ChannelRights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelRights" ADD CONSTRAINT "ChannelRights_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
