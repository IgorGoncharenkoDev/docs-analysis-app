import { DocumentGetPayload } from '@/generated/prisma/models/Document'
import { OrganizationGetPayload } from '@/generated/prisma/models/Organization'
import {
  documentForOrganizationSelect,
  safeDocumentSelect,
} from '@/lib/db/selects/document.select'
import { partialOrganizationSelect } from '@/lib/db/selects/organization.select'
import { DocumentWithRelations } from '@/types/document'

export type RegisterOrganizationDTO = OrganizationGetPayload<{
  select: typeof partialOrganizationSelect
}>

export type GetOrganizationDTO = OrganizationGetPayload<{
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

export type CreateDocumentDTO = {
  document: Pick<DocumentWithRelations, 'id' | 'name' | 'fileUrl'>
  organization: DocumentWithRelations['organization']
  uploadedBy: { name: DocumentWithRelations['user']['name'] | null }
}

export type GetDocumentDTO = DocumentGetPayload<typeof documentForOrganizationSelect>