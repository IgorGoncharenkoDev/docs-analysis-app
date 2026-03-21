import { NextResponse } from 'next/server'
import { ZodType } from 'zod'

import { ApiResponse } from '@/types/api'

type ValidateRequestParams<T> = {
  schema: ZodType<T>
  data: unknown
}

type ValidateRequestResult<T> =
  | { success: true; data: T }
  // if error then data is always null
  | { success: false; response: NextResponse<ApiResponse<any>> } // eslint-disable-line @typescript-eslint/no-explicit-any

export const validateRequest = <T>({
  schema,
  data,
}: ValidateRequestParams<T>): ValidateRequestResult<T> => {
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ')

    return {
      success: false,
      response: NextResponse.json({
        status: 'error',
        message
      } satisfies ApiResponse<null>,
        { status: 400 },
      ),
    }
  }

  return { success: true, data: parsed.data }
}

/* How to consume:
    const validation = validateRequest({ schema: mySchema, data: await req.json() })
    if (!validation.success) return validation.response
* */