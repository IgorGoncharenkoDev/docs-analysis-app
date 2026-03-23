import { DocumentGetPayload } from '@/generated/prisma/models/Document'
import { prisma } from '@/lib/db/prisma'

type Params = {
  documentId: string
  userId: string
}

type DocumentToDeleteReturn = DocumentGetPayload<{
  select: {
    id: true
    fileUrl: true
  }
}> | null

export async function getDocumentToDelete({
  documentId,
  userId,
}: Params): Promise<DocumentToDeleteReturn> {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      organization: {
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
      fileUrl: true,
    },
  })
}