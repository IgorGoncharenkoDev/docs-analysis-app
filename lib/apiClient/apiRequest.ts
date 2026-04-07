import { ClientResult } from '@/types/api'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit & { signal?: AbortSignal } = {},
): Promise<ClientResult<TResponse>> {
  const url = `${API_BASE_URL}/api${path}`

  const config: RequestInit = {
    ...options,
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  }

  try {
    const response = await fetch(url, config)

    if (response.status === 401) return { type: 'unauthorized' }
    if (response.status === 403) return { type: 'forbidden' }

    if (!response.ok) {
      const error: { message?: string } = await response
        .json()
        .catch(() => ({}))

      return {
        type: 'unknown_error',
        message: error.message ?? 'Request failed',
      }
    }

    const data: TResponse = await response.json()
    return { type: 'success', data }
  } catch (error) {
    return {
      type: 'network_error',
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}
