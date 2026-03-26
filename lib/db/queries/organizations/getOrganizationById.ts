import { prisma } from '@/lib/db/prisma'

export async function getOrganizationById({ clerkOrgId }: { clerkOrgId: string }) {
  return prisma.organization.findUnique({
    where: { clerkOrgId },
  });
}