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

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
  })
}

export async function getOrganizationByName(name: string) {
  return prisma.organization.findUnique({
    where: { name },
  })
}
