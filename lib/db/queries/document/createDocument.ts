import { prisma } from '@/lib/db/prisma'
import { DocumentFileData } from '@/types/document'

type CreateDocumentParams = {
  name: string,
  userId: string
  organizationId: string
  content: string | null
  fileData: DocumentFileData | null
}

export async function createDocument({
  name,
  userId,
  organizationId,
  content,
  fileData,
}: CreateDocumentParams) {
  return prisma.document.create({
    data: {
      name,
      content: fileData?.extractedContent || content || null,
      fileUrl: fileData?.url || null,
      fileSize: fileData?.size || 0,
      fileType: fileData?.type || 'unknown',
      organizationId,
      userId,
      aiKeywords: [],
    },
    include: {
      user: { select: { name: true } },
      organization: { select: { name: true, clerkOrgId: true } },
    },
  })
}