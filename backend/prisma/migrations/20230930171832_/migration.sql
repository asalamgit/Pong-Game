/*
  Warnings:

  - The `score` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "score",
ADD COLUMN     "score" INTEGER[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "state";
