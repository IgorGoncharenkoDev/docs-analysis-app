import { z } from 'zod';

export const registerOrganizationSchema = z.object({
  clerkOrgId: z.string(),
  name: z.string(),
  slug: z.string(),
});