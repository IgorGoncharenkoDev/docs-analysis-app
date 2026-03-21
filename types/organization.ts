import { OrganizationGetPayload } from '@/generated/prisma/models/Organization'
import { partialOrganizationSelect } from '@/lib/db/selects/organization.select'

export type RegisterOrganizationDTO = OrganizationGetPayload<{
  select: typeof partialOrganizationSelect
}>
