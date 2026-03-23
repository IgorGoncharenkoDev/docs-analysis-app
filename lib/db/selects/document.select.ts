import { DocumentSelect } from '@/generated/prisma/models/Document'

export const safeDocumentSelect = {
  id: true,
  name: true,
  aiSummary: true,
} satisfies DocumentSelect
