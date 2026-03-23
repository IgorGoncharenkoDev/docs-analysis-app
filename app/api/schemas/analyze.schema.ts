import { z } from 'zod';

export const analyzeSchema = z.object({
  documentId: z.cuid(),
  organizationClerkId: z.cuid(),
  analysisType: z.enum(
    ['test', 'summary', 'qa', 'sentiment', 'entities', 'extract']
  )
})