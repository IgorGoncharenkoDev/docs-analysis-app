import { prisma } from '@/lib/db/prisma'

export async function getOrganizationMembers({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  return prisma.organizationMember.findFirst({
    where: {
      organizationId,
      user: { clerkUserId: userId },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  })
}
