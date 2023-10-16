/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `ChannelUsersBan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChannelUsersBan_channelId_key" ON "ChannelUsersBan"("channelId");
