/*
  Warnings:

  - You are about to drop the column `status` on the `organizations` table. All the data in the column will be lost.
  - Made the column `clerkOrgId` on table `organizations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "status",
ALTER COLUMN "clerkOrgId" SET NOT NULL;

-- DropEnum
DROP TYPE "OrganizationStatus";
