import { OrganizationSelect } from '@/generated/prisma/models/Organization'

export const partialOrganizationSelect = {
  id: true,
  clerkOrgId: true,
  name: true,
  slug: true,
} satisfies OrganizationSelect
