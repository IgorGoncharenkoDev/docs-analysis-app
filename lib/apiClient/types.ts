import { ApiClientResponse } from '@/types/api'
import { GetDocumentDTO , GetOrganizationDTO, RegisterOrganizationDTO, ValidateOrganizationNameDTO } from '@/types/dto'

export type GetOrganizationByNameParams = {
  name: string
}

export type GetOrganizationByNameReturn = Promise<ApiClientResponse<GetOrganizationDTO>>

export type PostOrganizationParams = {
  name: string
  slug: string
  clerkOrgId: string
}

export type PostOrganizationReturn = Promise<ApiClientResponse<RegisterOrganizationDTO>>

export type ValidateOrganizationNameParams = {
  excludeId?: string,
  name: string
  slug: string
}

export type ValidateOrganizationNameReturn = Promise<ApiClientResponse<ValidateOrganizationNameDTO>>

export type GetDocumentsParams = {
  organizationId: string
}

export type GetDocumentsReturn = Promise<ApiClientResponse<{
  documents: GetDocumentDTO[]
  documentsCount: number
  organization: {
    id: string
    name: string
  }
}>>

export type PostDocumentParams = FormData

export type PostDocumentReturn = Promise<ApiClientResponse<GetDocumentDTO>>