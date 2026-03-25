import { DocumentGetPayload } from '@/generated/prisma/models/Document'

export type DocumentWithRelations = DocumentGetPayload<{
  include: {
    organization: {
      select: { clerkOrgId: true, name: true },
    },
    user: {
      select: { name: true },
    },
  }
}>

export type DocumentFileData = {
  url: string
  size: number
  type: string
  extractedContent: string | null
}