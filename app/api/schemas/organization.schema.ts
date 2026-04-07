import { z } from 'zod'

export const registerOrganizationSchema = z.object({
  name: z.string(),
  slug: z.string(),
})

export const getOrganizationByNameSchema = z.object({ name: z.string() })
