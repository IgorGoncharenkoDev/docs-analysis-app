import { DocumentGetPayload } from '@/generated/prisma/models/Document'
import { prisma } from '@/lib/db/prisma'
import { safeDocumentSelect } from '@/lib/db/selects/document.select'

type Params = {
  documentId: string
  summary: string
  analysisType: string
}

type Return = DocumentGetPayload<{
  select: typeof safeDocumentSelect
}>

export async function updateDocumentAnalysis({
  documentId,
  summary,
  analysisType,
}: Params): Promise<Return> {
  return prisma.document.update({
    where: { id: documentId },
    data: {
      aiSummary: summary,
      aiKeywords: ['analyzed'],
      sentiment: analysisType,
    },
    select: safeDocumentSelect,
  })
}