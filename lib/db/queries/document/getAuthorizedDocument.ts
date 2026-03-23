import { prisma } from '@/lib/db/prisma'

type Params = {
  documentId: string
  organizationClerkId: string
  userId: string
}

type AuthorizedDocumentReturn = {
  id: string
  content: string | null
} | null

export async function getAuthorizedDocument({
  documentId,
  organizationClerkId,
  userId,
}: Params): Promise<AuthorizedDocumentReturn> {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      organization: {
        clerkOrgId: organizationClerkId,
        members: {
          some: {
            user: {
              clerkUserId: userId,
            },
          },
        },
      },
    },
    select: {
      id: true,
      content: true,
    }
  })
}