import { z } from 'zod'

export const registerOrganizationSchema = z.object({
  clerkOrgId: z.string(),
  name: z.string(),
  slug: z.string(),
})

export const deleteOrganizationSchema = z.object({
  clerkOrgId: z.string(),
})

export const getOrganizationByNameSchema = z.object({ name: z.string() })

export const validateOrganizationNameSchema = z.object({
  excludeId: z.cuid().optional(),
  name: z.string(),
  slug: z.string(),
})