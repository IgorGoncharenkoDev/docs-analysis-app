import { ApiClientResponse } from '@/types/api'
import { GetOrganizationDTO, RegisterOrganizationDTO, ValidateOrganizationNameDTO } from '@/types/dto'

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