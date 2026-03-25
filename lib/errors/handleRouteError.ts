import { NextResponse } from 'next/server'

import { ApiResponse } from '@/types/api'

import { AppError } from './AppError'

export function handleRouteError(error: unknown): NextResponse<ApiResponse<null>> {
  // app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || error.type,
      } satisfies ApiResponse<null>,
      { status: error.statusCode }
    )
  }

  // prisma unique constraint
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  ) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Resource already exists',
      } satisfies ApiResponse<null>,
      { status: 409 }
    )
  }

  // unknown errors
  console.error('Unhandled error:', error)

  return NextResponse.json(
    {
      status: 'error',
      message: 'Internal server error',
    } satisfies ApiResponse<null>,
    { status: 500 }
  )
}

/* How to use:
    try { .. } catch (error) {
      return handleRouteError(error)
    }
* */