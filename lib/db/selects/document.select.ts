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
    name: true,
    content: true,
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