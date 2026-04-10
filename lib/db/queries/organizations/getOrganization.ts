import { OrganizationGetPayload,OrganizationInclude } from '@/generated/prisma/models/Organization'
import { prisma } from '@/lib/db/prisma'

export async function getOrganizationById({
  clerkOrgId,
}: {
  clerkOrgId: string
}) {
  return prisma.organization.findUnique({
    where: { clerkOrgId },
  })
}

export async function getOrganizationBySlug<
  T extends OrganizationInclude | undefined
>({ slug, include }: { slug: string, include?: T }) {
  return prisma.organization.findUnique({
    where: { slug },
    ...(include && { include }),
  }) as Promise<
    OrganizationGetPayload<{
      include: T
    }> | null
  >
}

export async function getOrganizationByName(name: string) {
  return prisma.organization.findUnique({
    where: { name },
  })
}
