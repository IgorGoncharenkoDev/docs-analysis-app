import { ZodError, ZodType } from 'zod'

import { AppError } from '@/lib/errors/AppError'

type ParseFormDataParams<T> = {
  formData: FormData
  schema: ZodType<T>
}

export function parseFormData<T>({
  formData,
  schema,
}: ParseFormDataParams<T>): T {
  try {
    // extracting the file separately since only string entries are only included in Object.fromEntries
    const rawData = Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key]) => key !== 'file')
    );
    const file = formData.get('file'); // nullable
    return schema.parse({
      ...rawData,
      file,
    });
    // in case non-string types do (e.g.): isPublic: z.coerce.boolean()
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError({
        type: 'bad_request',
        message: error.issues.map(i => i.message).join(', '),
      })
    }
    throw error
  }
}