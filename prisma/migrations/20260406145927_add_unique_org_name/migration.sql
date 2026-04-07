-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'FAILED', 'PENDING');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "clerkOrgId" DROP NOT NULL;
