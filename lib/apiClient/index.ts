import { apiRequest } from '@/lib/apiClient/apiRequest'
import {
  GetDocumentsParams,
  GetDocumentsReturn,
  GetOrganizationByNameParams,
  GetOrganizationByNameReturn,
  PostDocumentParams,
  PostDocumentReturn,
  PostOrganizationParams,
  PostOrganizationReturn,
  ValidateOrganizationNameParams,
  ValidateOrganizationNameReturn,
} from '@/lib/apiClient/types'
import {
  ApiClientResult,
  ApiResponse,
  ClientResult,
  TransportError,
} from '@/types/api'

export const apiClient = {
  analyze: {},
  documents: {
    get: async ({ organizationId }: GetDocumentsParams): GetDocumentsReturn =>
      apiRequest(`/api/documents/?organizationId=${organizationId}`),
    post: async (formData: PostDocumentParams): PostDocumentReturn =>
      apiRequest('/documents', { method: 'POST', body: formData }),
  },
  organizations: {
    getByName: async ({
      name,
    }: GetOrganizationByNameParams): Promise<GetOrganizationByNameReturn> =>
      apiRequest(`/organizations/by-name/${name}`),
    post: async ({
      name,
      slug,
      clerkOrgId,
    }: PostOrganizationParams): PostOrganizationReturn =>
      apiRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug,
          clerkOrgId,
        }),
      }),
    validateName: async ({
      excludeId,
      name,
      slug,
    }: ValidateOrganizationNameParams): ValidateOrganizationNameReturn =>
      apiRequest('/organizations/validate-name', {
        method: 'POST',
        body: JSON.stringify({
          excludeId,
          name,
          slug,
        }),
      }),
    delete: async (clerkOrgId: string) =>
      apiRequest(`/organizations`, {
        method: 'DELETE',
        body: JSON.stringify({ clerkOrgId }),
      }),
  },
}

export type ApiClient = typeof apiClient

const mapTransportError = (error: TransportError): string => {
  switch (error.type) {
    case 'unauthorized':
      return 'Unauthorized'

    case 'forbidden':
      return 'Forbidden'

    case 'network_error':
      return error.message ?? 'Network error'

    default:
      return 'Unknown error'
  }
}

/* How to consume:

  const result = unwrapApiResult(await apiClient.fn())
  if (!result.ok) {
    ..
  }

*/
export const unwrapApiResult = <T>(
  result: ClientResult<ApiResponse<T>>,
): ApiClientResult<T> => {
  if (result.type !== 'success') {
    return {
      ok: false,
      error: mapTransportError(result),
    }
  }

  if (result.data.status === 'error') {
    return {
      ok: false,
      error: result.data.message,
    }
  }

  return {
    ok: true,
    data: result.data.data,
  }
}
