import {
  DocumentDefaultArgs,
  DocumentSelect,
} from '@/generated/prisma/models/Document'

export const safeDocumentSelect = {
  id: true,
  name: true,
  aiSummary: true,
} satisfies DocumentSelect

export const documentForOrganizationSelect = {
  select: {
    id: true,
    name: true,
    aiSummary: true,
    aiKeywords: true,
    fileSize: true,
    fileUrl: true,
    content: true,
    sentiment: true,
    createdAt: true,
    user: {
      select: {
        name: true,
        email: true,
      },
    },
    organization: {
      select: {
        name: true,
        clerkOrgId: true,
      },
    },
  },
} satisfies DocumentDefaultArgs