import { ApiClientResponse } from '@/types/api'
import { GetOrganizationDTO, RegisterOrganizationDTO } from '@/types/dto'

export type GetOrganizationByNameParams = {
  name: string
}

export type GetOrganizationByNameReturn = Promise<ApiClientResponse<GetOrganizationDTO>>

export type PostOrganizationParams = {
  name: string
  slug: string
}

export type PostOrganizationReturn = Promise<ApiClientResponse<RegisterOrganizationDTO>>