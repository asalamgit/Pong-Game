/*
  Warnings:

  - The `score` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "score",
ADD COLUMN     "score" INTEGER[];

-- CreateTable
CREATE TABLE "ChannelRights" (
    "id" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "ChannelRights_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChannelRights" ADD CONSTRAINT "ChannelRights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelRights" ADD CONSTRAINT "ChannelRights_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
