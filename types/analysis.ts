import { DocumentGetPayload } from '@/generated/prisma/models/Document'
import { safeDocumentSelect } from '@/lib/db/selects/document.select'

export type AnalysisReturnDTO = {
  summary?: string
  document: DocumentGetPayload<{
    select: typeof safeDocumentSelect
  }>
}