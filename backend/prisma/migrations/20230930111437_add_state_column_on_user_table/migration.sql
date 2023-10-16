/*
  Warnings:

  - Changed the type of `type` on the `Notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Provider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `state` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('ONLINE', 'OFFLINE', 'IN_GAME');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'FACEBOOK', 'FORTYTWO');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FRIENDSHIP');

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "type",
ADD COLUMN     "type" "ProviderType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "state" "UserState" NOT NULL;
