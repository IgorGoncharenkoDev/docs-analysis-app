import { apiRequest } from '@/lib/apiClient/apiRequest'
import {
  GetOrganizationByNameParams,
  GetOrganizationByNameReturn,
  PostOrganizationParams,
  PostOrganizationReturn,
} from '@/lib/apiClient/types'
import {
  ApiClientResult,
  ApiResponse,
  ClientResult,
  TransportError,
} from '@/types/api'

export const apiClient = {
  analyze: {},
  documents: {},
  organizations: {
    getByName: async ({ name }: GetOrganizationByNameParams): Promise<GetOrganizationByNameReturn> => apiRequest(`/organizations/by-name/${name}`),
    post: async ({
      name,
      slug,
    }: PostOrganizationParams): PostOrganizationReturn =>
      apiRequest('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug,
        }),
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
