export type TransportError =
  | { type: 'unauthorized' }
  | { type: 'forbidden' }
  | { type: 'network_error'; message?: string }
  | { type: 'unknown_error'; message?: string }

export type ClientResult<T> = TransportError | { type: 'success'; data: T }

// API contract
export type ApiResponse<T> =
  | { status: 'error'; message: string }
  | { status: 'success'; message?: string; data: T }

// client wrapper
export type ApiClientResponse<T> = ClientResult<ApiResponse<T>>

export type ApiClientResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }