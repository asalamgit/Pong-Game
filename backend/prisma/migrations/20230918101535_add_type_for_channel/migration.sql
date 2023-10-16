/*
  Warnings:

  - Added the required column `type` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('PUBLIC', 'PROTECTED', 'PRIVATE');

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "type" "ChannelType" NOT NULL;
