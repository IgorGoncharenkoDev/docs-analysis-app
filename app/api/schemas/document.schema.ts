import { z } from 'zod'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const allowedTypes = ['text/plain', 'application/pdf']

export const createDocumentSchema = z
  .object({
    name: z.string().min(1).trim(),
    content: z.string().min(1).optional(),
    clerkOrgId: z.string(),
    file: z
      .file()
      .refine((file) => file.size <= MAX_SIZE, {
        message: `File size must be less than ${MAX_SIZE / 1024 / 1024}MB`,
      })
      .refine((file) => allowedTypes.includes(file.type), {
        message: 'Unsupported file type',
      })
      .optional(),
  })
  // preventing empty submissions
  .refine((data) => data.file || data.content, {
    message: 'Either file or content must be provided',
  })

export const deleteDocumentSchema = z.object({
  documentId: z.cuid(),
})

export const getDocumentsSchema = z.object({ organizationId: z.string() })