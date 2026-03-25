import { prisma } from '@/lib/db/prisma'
import { AppError } from '@/lib/errors/AppError'

type GetAuthorizedUserForOrgParams = {
  clerkOrgId: string
  clerkUserId: string
}

export async function getAuthorizedUserForOrg({
  clerkOrgId,
  clerkUserId,
}: GetAuthorizedUserForOrgParams) {
  const organization = await prisma.organization.findUnique({
    where: { clerkOrgId },
  })
  if (!organization) {
    throw new AppError({ type: 'not_found', message: 'Organization not found' })
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId,
      memberships: {
        some: {
          organizationId: organization.id,
        }
      },
    },
  })

  if (!user) {
    throw new AppError({
      type: 'forbidden',
      message: 'User not authorized for this organization',
    })
  }

  return { user, organization }
}
