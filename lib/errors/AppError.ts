export type AppErrorType =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'bad_request'
  | 'conflict'
  | 'external_error'

export class AppError extends Error {
  type: AppErrorType
  statusCode: number

  constructor({ type, message }: { type: AppErrorType; message?: string }) {
    super(message)

    this.type = type

    const map: Record<AppErrorType, number> = {
      unauthorized: 401,
      forbidden: 403,
      not_found: 404,
      bad_request: 400,
      conflict: 409,
      external_error: 502,
    }

    this.statusCode = map[type]
  }
}

/* How to use:
    throw new AppError({ type: 'unauthorized', message: 'Unauthorized' })
    throw new AppError({ type: 'not_found', message: 'User not found' })
*/
