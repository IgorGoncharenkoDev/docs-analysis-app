import { AnalysisType } from '@/types'
import { ApiClientResponse } from '@/types/api'
import {
  AnalysisReturnDTO,
  GetDocumentDTO,
  GetDocumentsDTO,
  GetOrganizationDTO,
  RegisterOrganizationDTO,
  ValidateOrganizationNameDTO,
} from '@/types/dto'

export type GetOrganizationByNameParams = {
  name: string
}

export type GetOrganizationByNameReturn = Promise<
  ApiClientResponse<GetOrganizationDTO>
>

export type PostOrganizationParams = {
  name: string
  slug: string
  clerkOrgId: string
}

export type PostOrganizationReturn = Promise<
  ApiClientResponse<RegisterOrganizationDTO>
>

export type ValidateOrganizationNameParams = {
  excludeId?: string
  name: string
  slug: string
}

export type ValidateOrganizationNameReturn = Promise<
  ApiClientResponse<ValidateOrganizationNameDTO>
>

export type GetDocumentsParams = {
  organizationId: string
}
export type GetDocumentsReturn = Promise<ApiClientResponse<GetDocumentsDTO>>

export type PostDocumentParams = FormData
export type PostDocumentReturn = Promise<ApiClientResponse<GetDocumentDTO>>

export type DeleteDocumentParams = {
  documentId: string
}
export type DeleteDocumentReturn = Promise<ApiClientResponse<null>>

export type PostAnalyzeDocumentParams = {
  analysisType: AnalysisType
  documentId: string
  organizationClerkId: string
}
export type PostAnalyzeDocumentReturn = Promise<
  ApiClientResponse<AnalysisReturnDTO>
>
