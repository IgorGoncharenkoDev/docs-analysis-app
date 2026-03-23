import { DocumentGetPayload } from '@/generated/prisma/models/Document'
import { OrganizationGetPayload } from '@/generated/prisma/models/Organization'
import { safeDocumentSelect } from '@/lib/db/selects/document.select'
import { partialOrganizationSelect } from '@/lib/db/selects/organization.select'

export type RegisterOrganizationDTO = OrganizationGetPayload<{
  select: typeof partialOrganizationSelect
}>

export type DocumentDTO = DocumentGetPayload<{
  select: typeof safeDocumentSelect
}>

export type AnalysisReturnDTO = {
  summary?: string
  document: DocumentGetPayload<{
    select: typeof safeDocumentSelect
  }>
}