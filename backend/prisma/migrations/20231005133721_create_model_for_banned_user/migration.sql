-- AlterTable
ALTER TABLE "User" ADD COLUMN     "channelUsersBanId" TEXT;

-- CreateTable
CREATE TABLE "ChannelUsersBan" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "ChannelUsersBan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_channelUsersBanId_fkey" FOREIGN KEY ("channelUsersBanId") REFERENCES "ChannelUsersBan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelUsersBan" ADD CONSTRAINT "ChannelUsersBan_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
